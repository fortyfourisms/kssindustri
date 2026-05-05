import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import type { CurrentUser } from '@/types/user.types';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';

// ─── MFA transient tokens ─────────────────────────────────────────────────────
// Disimpan di sessionStorage HANYA selama alur MFA berlangsung (one-time use).
// Ini BUKAN auth token — hanya step token untuk proses MFA.
// Dihapus segera setelah MFA selesai.
const MFA_SETUP_TOKEN_KEY = 'mfa_setup_token_tmp';
const MFA_VERIFY_TOKEN_KEY = 'mfa_verify_token_tmp';

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
    return decryptData(val) || null;
}

function saveMfaSetupToken(token: string) { saveToken(MFA_SETUP_TOKEN_KEY, token); }
function saveMfaVerifyToken(token: string) { saveToken(MFA_VERIFY_TOKEN_KEY, token); }
function clearMfaSessionTokens() {
    sessionStorage.removeItem(MFA_SETUP_TOKEN_KEY);
    sessionStorage.removeItem(MFA_VERIFY_TOKEN_KEY);
}
export function readMfaSetupToken(): string | null { return readToken(MFA_SETUP_TOKEN_KEY); }
export function readMfaVerifyToken(): string | null { return readToken(MFA_VERIFY_TOKEN_KEY); }

// ─── Types ────────────────────────────────────────────────────────────────────

export type { CurrentUser } from '@/types/user.types';

interface AuthResult {
    authenticated: boolean;
    mfaSetup?: boolean;
    mfaVerify?: boolean;
    error?: string;
    user?: CurrentUser;
}

interface AuthState {
    // ── In-memory only — TIDAK disimpan ke storage apapun ─────────────────────
    // Auth state hidup di memory Zustand. Session di-restore dari HTTP-only
    // cookie via GET /api/me setiap kali app di-mount (lihat ProtectedRoute).
    authenticated: boolean;
    currentUser: CurrentUser | null;

    // ── Transient state ───────────────────────────────────────────────────────
    loading: boolean;
    error: string | null;
    setupToken: string | null;   // MFA step — in memory + sessionStorage backup
    mfaToken: string | null;     // MFA step — in memory + sessionStorage backup

    // ── Derived getters ───────────────────────────────────────────────────────
    isMfaSetupRequired: () => boolean;
    isMfaVerifyRequired: () => boolean;
    formattedJoinDate: () => string;

    // ── Actions ───────────────────────────────────────────────────────────────
    authenticateUser: (payload: LoginPayload) => Promise<AuthResult>;
    completeMfaSetup: (response: unknown) => void;
    completeMfaVerify: (response: unknown) => void;
    clearMfaState: () => void;
    registerUser: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
    clearSessionState: () => void;
    logUserOut: () => Promise<void>;
    syncCurrentUser: (response: unknown) => void;

    /**
     * Restore session dari HTTP-only cookie via GET /api/me.
     * Dipanggil oleh ProtectedRoute saat navigasi ke halaman protected.
     * Mengembalikan true jika cookie masih valid dan state berhasil di-hydrate.
     * Berbeda dari bootstrapSession: langsung GET /api/me (tidak refresh dulu).
     */
    rehydrateFromServer: () => Promise<boolean>;

    /**
     * Silent session restore saat app pertama kali mount (bootstrapApp).
     * Urutan:
     *   1. POST /api/refresh — cek apakah refresh token cookie masih valid.
     *   2. Jika berhasil → GET /api/me → hydrate store → return true.
     *   3. Jika gagal (guest / expired) → set unauthenticated → return false (silent).
     * Tidak pernah melempar error — cocok dipanggil dari bootstrapApp().
     */
    bootstrapSession: () => Promise<boolean>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a backend user response to CurrentUser.
 * Handles both flat `{ id, username, ... }` and nested `{ user: { ... } }` shapes.
 */
function mapToCurrentUser(data: unknown): CurrentUser {
    const u = (data as { user?: unknown })?.user ?? data;
    const user = u as Record<string, unknown>;
    const rawHasCompany = user.has_company;
    const displayName = String(user.display_name ?? user.name ?? user.username ?? '');
    const jabatan = String(user.jabatan ?? '');
    const fotoProfile = String(user.foto_profile ?? '');
    const createdAt = String(user.created_at ?? user.createdAt ?? '');
    const updatedAt = String(user.updated_at ?? user.updatedAt ?? '');
    return {
        id: String(user.id ?? ''),
        username: String(user.username ?? ''),
        name: displayName,
        displayName,
        display_name: displayName,
        email: String(user.email ?? ''),
        role: String(user.role ?? user.role_name ?? 'user'),
        roleId: String(user.role_id ?? ''),
        roleName: String(user.role_name ?? user.role ?? ''),
        jabatan,
        jabatan_name: String(user.jabatan_name ?? user.jabatan ?? ''),
        id_jabatan: user.id_jabatan != null ? String(user.id_jabatan) : '',
        companyId: String(user.id_perusahaan ?? ''),
        fotoProfile,
        foto_profile: fotoProfile,
        banner: String(user.banner ?? ''),
        status: String(user.status ?? ''),
        mfaEnabled: Boolean(user.mfa_enabled),
        id_perusahaan: user.id_perusahaan != null ? String(user.id_perusahaan) : '',
        perusahaan: (user.perusahaan as CurrentUser["perusahaan"]) ?? null,
        hasCompany:
            typeof rawHasCompany === 'boolean'
                ? rawHasCompany
                : user.id_perusahaan != null
                    ? Boolean(String(user.id_perusahaan))
                    : null,
        createdAt,
        updatedAt,
        created_at: createdAt,
        updated_at: updatedAt,
    };
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Murni in-memory — tidak ada persist middleware.
// Auth state tidak pernah menyentuh localStorage atau sessionStorage.
// Session restore dilakukan via HTTP-only cookie (rehydrateFromServer).

export const useAuthStore = create<AuthState>()(
    (set, get) => ({
        // ── Initial state ───────────────────────────────────────────────────────
        authenticated: false,
        currentUser: null,
        loading: false,
        error: null,
        setupToken: null,
        mfaToken: null,

        // ── Derived (call as functions) ─────────────────────────────────────────
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

                // Case 3: Backend set HTTP-only cookie → hydrate store dari response
                const userData = mapToCurrentUser(response);
                set({ authenticated: true, currentUser: userData, loading: false });
                return { authenticated: true, user: userData };
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

        clearSessionState: () => {
            clearMfaSessionTokens();
            set({
                authenticated: false,
                currentUser: null,
                error: null,
                setupToken: null,
                mfaToken: null,
            });
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
            try {
                await authService.logout();
            } finally {
                get().clearSessionState();
            }
        },

        syncCurrentUser: (response) => {
            const userData = mapToCurrentUser(response);
            set({ authenticated: true, currentUser: userData });
        },

        rehydrateFromServer: async () => {
            try {
                const response = await authService.verifySession();
                if (!response) return false;
                const userData = mapToCurrentUser(response);
                set({ authenticated: true, currentUser: userData });
                return true;
            } catch {
                // Cookie tidak valid atau expired — biarkan state tetap unauthenticated
                set({ authenticated: false, currentUser: null });
                return false;
            }
        },

        bootstrapSession: async () => {
            try {
                // Step 1: Coba refresh token dulu — bypass interceptor apiClient
                // agar tidak memicu loop jika tidak ada session.
                await authService.refresh();

                // Step 2: Refresh berhasil → ambil data user
                const response = await authService.verifySession();
                if (!response) return false;
                const userData = mapToCurrentUser(response);
                set({ authenticated: true, currentUser: userData });
                return true;
            } catch {
                // Tidak ada refresh token valid — guest experience.
                // Tidak throw, tidak log error — ini kondisi normal.
                set({ authenticated: false, currentUser: null });
                return false;
            }
        },
    })
);
