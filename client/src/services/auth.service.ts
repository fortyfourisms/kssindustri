import { apiClient } from '@/services/apiClient';
import type {
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    MfaSetupResponse,
    MfaEnableResponse,
    MfaVerifyResponse,
} from '@/types/auth.types';

const REFRESH_COOLDOWN_MS = 15000;

let refreshInFlight: Promise<unknown> | null = null;
let lastRefreshAt = 0;

/**
 * Authentication Service — Cookie Auth + MFA.
 * Backend sets HTTP-only cookie on login.
 * MFA tokens (setup_token, mfa_token) are returned in response body.
 */
class AuthService {
    /**
     * Login — backend returns setup_token, mfa_token, or access_token.
     */
    async login(payload: LoginPayload): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/api/login', {
            identifier: payload.identifier,
            password: payload.password,
            "cf-turnstile-response": payload.turnstileToken,
            // Keep multiple field variants for backend compatibility.
            turnstile_token: payload.turnstileToken,
            turnstileToken: payload.turnstileToken,
            turnstiletoken: payload.turnstileToken,
        });
    }

    /**
     * Register new user.
     */
    async register(payload: RegisterPayload): Promise<AuthResponse> {
        const { turnstileToken, ...registrationPayload } = payload;
        return apiClient.post<AuthResponse>('/api/register', {
            ...registrationPayload,
            "cf-turnstile-response": turnstileToken,
            // Keep multiple field variants for backend compatibility.
            turnstile_token: turnstileToken,
            turnstileToken,
            turnstiletoken: turnstileToken,
        });
    }

    /**
     * Logout — backend clears the HTTP-only cookie.
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post<void>('/api/logout', {});
        } catch {
            // best-effort: even if it fails, local state will be cleared
        }
    }

    /**
     * Refresh access token via POST /api/refresh.
     * Backend akan membaca refresh token dari HTTP-only cookie dan menerbitkan
     * access token baru. Menggunakan raw fetch (bukan apiClient) agar tidak
     * memicu interceptor 401 dan menyebabkan infinite loop.
     * Melempar error jika refresh token sudah expired atau tidak valid.
     */
    async refresh(): Promise<unknown> {
        const now = Date.now();
        if (refreshInFlight) {
            return refreshInFlight;
        }

        if (now - lastRefreshAt < REFRESH_COOLDOWN_MS) {
            return;
        }

        const BASE_URL = (window as any)._env_?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';
        refreshInFlight = (async () => {
            const res = await fetch(`${BASE_URL}/api/refresh`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) {
                throw new Error('Session expired');
            }
            const text = await res.text();
            if (text.trim()) {
                try {
                    const data = JSON.parse(text) as Record<string, unknown>;
                    return data;
                } catch {
                    return undefined;
                }
            }
            lastRefreshAt = Date.now();
            return undefined;
        })();

        try {
            const result = await refreshInFlight;
            lastRefreshAt = Date.now();
            return result;
        } finally {
            refreshInFlight = null;
        }
    }

    /**
     * Verify session: GET /api/me.
     * Cookie is sent automatically. Returns current user if valid.
     */
    async verifySession(): Promise<unknown> {
        return apiClient.get<unknown>('/api/me');
    }

    // ── MFA Endpoints ─────────────────────────────────────────────────────────

    /**
     * MFA Setup — request QR code and secret for first-time TOTP setup.
     */
    async mfaSetup(setupToken: string): Promise<MfaSetupResponse> {
        return apiClient.post<MfaSetupResponse>('/api/mfa/setup', {
            setup_token: setupToken,
        });
    }

    /**
     * MFA Enable — verify the 6-digit code during first-time setup.
     * On success, returns access_token + user data.
     */
    async mfaEnable(setupToken: string, code: string): Promise<MfaEnableResponse> {
        return apiClient.post<MfaEnableResponse>('/api/mfa/enable', {
            setup_token: setupToken,
            code,
        });
    }

    /**
     * MFA Verify — verify the 6-digit code for returning users.
     * On success, returns access_token + user data.
     */
    async mfaVerify(mfaToken: string, code: string): Promise<MfaVerifyResponse> {
        return apiClient.post<MfaVerifyResponse>('/api/mfa/verify', {
            mfa_token: mfaToken,
            code,
        });
    }
}

export const authService = new AuthService();
