// ─── Auth Types ──────────────────────────────────────────────────────────────

import type { UserSessionPayload } from "@/types/user.types";

export interface LoginPayload {
    identifier: string;
    password: string;
    turnstileToken?: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    /** Existing company ID */
    id_perusahaan?: string;
    /** New company name (when creating a new one) */
    nama_perusahaan?: string;
    turnstileToken?: string;
}

/**
 * Login response from backend.
 * Returns one of three mutually exclusive flows:
 *  - setup_token  → first-time MFA setup required
 *  - mfa_token    → returning user, MFA verification required
 *  - user/session → direct login via HTTP-only cookie (no MFA)
 */
export interface AuthResponse {
    message?: string;
    setup_token?: string;
    mfa_token?: string;
    user?: AuthUser;
    [key: string]: unknown;
}

export type AuthUser = UserSessionPayload;

/** POST /api/mfa/setup response */
export interface MfaSetupResponse {
    secret: string;
    otpauth_url: string;
}

/** POST /api/mfa/enable response */
export interface MfaEnableResponse {
    message?: string;
    user: AuthUser;
}

/** POST /api/mfa/verify response */
export interface MfaVerifyResponse {
    message?: string;
    user: AuthUser;
}
