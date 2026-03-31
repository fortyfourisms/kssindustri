// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface LoginPayload {
    identifier: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    /** Existing company ID */
    id_perusahaan?: string;
    /** New company name (when creating a new one) */
    nama_perusahaan?: string;
}

/**
 * Login response from backend.
 * Returns one of three mutually exclusive flows:
 *  - setup_token  → first-time MFA setup required
 *  - mfa_token    → returning user, MFA verification required
 *  - access_token → direct login (no MFA)
 */
export interface AuthResponse {
    message?: string;
    setup_token?: string;
    mfa_token?: string;
    access_token?: string;
    user?: AuthUser;
    [key: string]: unknown;
}

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    name?: string;
    id_jabatan?: string;
    role_id?: string;
    role_name?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
}

/** POST /api/mfa/setup response */
export interface MfaSetupResponse {
    secret: string;
    otpauth_url: string;
}

/** POST /api/mfa/enable response */
export interface MfaEnableResponse {
    message?: string;
    access_token: string;
    user: AuthUser;
}

/** POST /api/mfa/verify response */
export interface MfaVerifyResponse {
    message?: string;
    access_token: string;
    user: AuthUser;
}
