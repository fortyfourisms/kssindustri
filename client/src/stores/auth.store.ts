import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';

// Temporary sessionStorage keys for MFA tokens (cleared after use)
const MFA_SETUP_TOKEN_KEY = 'mfa_setup_token_tmp';
const MFA_VERIFY_TOKEN_KEY = 'mfa_verify_token_tmp';

// Basic synchronous XOR encryption to obfuscate sensitive data in storage
const ENCRYPTION_KEY = "kssindustri_secure_storage_key_2026";

function encryptData(text: string): string {
    try {
        const encodedText = encodeURIComponent(text);
        let result = '';
        for (let i = 0; i < encodedText.length; i++) {
            result += String.fromCharCode(encodedText.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
        }
        return btoa(result);
    } catch {
        return '';
    }
}

function decryptData(base64: string): string {
    try {
        const text = atob(base64);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
        }
        return decodeURIComponent(result);
    } catch {
        return '';
    }
}

function saveToken(key: string, token: string) {
    sessionStorage.setItem(key, encryptData(token));
}

function readToken(key: string): string | null {
    const val = sessionStorage.getItem(key);
    if (!val) return null;
    const decrypted = decryptData(val);
    return decrypted || null;
}

function saveMfaSetupToken(token: string) { saveToken(MFA_SETUP_TOKEN_KEY, token); }
function saveMfaVerifyToken(token: string) { saveToken(MFA_VERIFY_TOKEN_KEY, token); }
function clearMfaSessionTokens() {
    sessionStorage.removeItem(MFA_SETUP_TOKEN_KEY);
    sessionStorage.removeItem(MFA_VERIFY_TOKEN_KEY);
}
export function readMfaSetupToken(): string | null { return readToken(MFA_SETUP_TOKEN_KEY); }
export function readMfaVerifyToken(): string | null { return readToken(MFA_VERIFY_TOKEN_KEY); }

// Custom encrypted storage for zustand
const encryptedSessionStorage = {
    getItem: (name: string): string | null => {
        const value = sessionStorage.getItem(name);
        if (!value) return null;
        return decryptData(value) || null;
    },
    setItem: (name: string, value: string): void => {
        sessionStorage.setItem(name, encryptData(value));
    },
    removeItem: (name: string): void => {
        sessionStorage.removeItem(name);
    }
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrentUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface AuthResult {
    authenticated: boolean;
    mfaSetup?: boolean;
    mfaVerify?: boolean;
    error?: string;
}

interface AuthState {
    // ── Persisted (sessionStorage via persist middleware) ──────────────────────
    authenticated: boolean;
    currentUser: CurrentUser | null;

    // ── Transient (NOT persisted — tokens live only in memory) ────────────────
    loading: boolean;
    error: string | null;
    setupToken: string | null;
    mfaToken: string | null;

    // ── Derived getters (computed via selectors or inline) ────────────────────
    isAdmin: () => boolean;
    isMfaSetupRequired: () => boolean;
    isMfaVerifyRequired: () => boolean;
    formattedJoinDate: () => string;

    // ── Actions ───────────────────────────────────────────────────────────────
    authenticateUser: (payload: LoginPayload) => Promise<AuthResult>;
    completeMfaSetup: (response: unknown) => void;
    completeMfaVerify: (response: unknown) => void;
    clearMfaState: () => void;
    registerUser: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
    logUserOut: () => Promise<void>;
    checkAuthOnStartup: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a backend user response to CurrentUser.
 * Handles both flat `{ id, username, ... }` and nested `{ user: { ... } }` shapes.
 */
function mapToCurrentUser(data: unknown): CurrentUser {
    const u = (data as { user?: unknown })?.user ?? data;
    const user = u as Record<string, unknown>;
    return {
        id: String(user.id ?? ''),
        username: String(user.username ?? ''),
        name: String(user.name ?? user.username ?? ''),
        email: String(user.email ?? ''),
        role: String(user.role ?? user.role_name ?? 'user'),
        createdAt: String(user.created_at ?? user.createdAt ?? ''),
    };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // ── Initial state ───────────────────────────────────────────────────────
            authenticated: false,
            currentUser: null,
            loading: false,
            error: null,
            setupToken: null,
            mfaToken: null,

            // ── Derived (use as functions, not properties) ──────────────────────────
            isAdmin: () => get().currentUser?.role === 'admin',
            isMfaSetupRequired: () => !!get().setupToken,
            isMfaVerifyRequired: () => !!get().mfaToken,
            formattedJoinDate: () => {
                const date = get().currentUser?.createdAt;
                if (!date) return '';
                try {
                    return new Date(date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                    });
                } catch {
                    return date;
                }
            },

            // ── Actions ─────────────────────────────────────────────────────────────
            authenticateUser: async (payload) => {
                set({ loading: true, error: null, setupToken: null, mfaToken: null });
                try {
                    const response = await authService.login(payload);

                    // Case 1: MFA first-time setup required
                    if (response.setup_token) {
                        saveMfaSetupToken(response.setup_token);
                        set({ setupToken: response.setup_token, loading: false });
                        return { authenticated: false, mfaSetup: true };
                    }

                    // Case 2: MFA verification required (returning user)
                    if (response.mfa_token) {
                        saveMfaVerifyToken(response.mfa_token);
                        set({ mfaToken: response.mfa_token, loading: false });
                        return { authenticated: false, mfaVerify: true };
                    }

                    // Case 3: Direct login (access_token or cookie-based)
                    const userData = mapToCurrentUser(response);
                    set({ authenticated: true, currentUser: userData, loading: false });
                    return { authenticated: true };
                } catch (error: unknown) {
                    const msg = error instanceof Error ? error.message : 'Login failed';
                    set({
                        error: msg, authenticated: false, currentUser: null, loading: false,
                        setupToken: null, mfaToken: null
                    });
                    return { authenticated: false, error: msg };
                }
            },

            completeMfaSetup: (response) => {
                const userData = mapToCurrentUser(response);
                clearMfaSessionTokens();
                set({ authenticated: true, currentUser: userData, setupToken: null, mfaToken: null });
            },

            completeMfaVerify: (response) => {
                const userData = mapToCurrentUser(response);
                clearMfaSessionTokens();
                set({ authenticated: true, currentUser: userData, setupToken: null, mfaToken: null });
            },

            clearMfaState: () => {
                clearMfaSessionTokens();
                set({ setupToken: null, mfaToken: null });
            },

            registerUser: async (payload) => {
                set({ loading: true, error: null });
                try {
                    await authService.register(payload);
                    return { success: true };
                } catch (error: unknown) {
                    const msg = error instanceof Error ? error.message : 'Registration failed';
                    set({ error: msg });
                    return { success: false, error: msg };
                } finally {
                    set({ loading: false });
                }
            },

            logUserOut: async () => {
                await authService.logout();
                set({
                    authenticated: false,
                    currentUser: null,
                    error: null,
                    setupToken: null,
                    mfaToken: null,
                });
            },

            checkAuthOnStartup: () => {
                // The persist middleware already restores authenticated + currentUser from
                // sessionStorage on mount. This action validates the hydrated state.
                const { authenticated, currentUser } = get();
                if (authenticated && !currentUser) {
                    // Inconsistent state — reset
                    set({ authenticated: false, currentUser: null });
                }
            },
        }),
        {
            name: 'auth-session',           // sessionStorage key
            storage: createJSONStorage(() => encryptedSessionStorage),
            // ⚠️ Only persist UI state — tokens are NEVER persisted
            partialize: (state) => ({
                authenticated: state.authenticated,
                currentUser: state.currentUser,
            }),
        }
    )
);
