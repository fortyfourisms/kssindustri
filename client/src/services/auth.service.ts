import { apiClient } from './apiClient';
import type {
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    MfaSetupResponse,
    MfaEnableResponse,
    MfaVerifyResponse,
} from '@/types/auth.types';

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
            username: payload.email,
            password: payload.password,
        });
    }

    /**
     * Register new user.
     */
    async register(payload: RegisterPayload): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/api/register', payload);
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
