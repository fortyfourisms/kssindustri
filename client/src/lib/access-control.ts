import type { CurrentUser } from "@/stores/auth.store";

export const ROLE_USER = "user";
export const ROLE_USER_PIC = "user_pic";

export const LMS_ALLOWED_ROLES = [ROLE_USER, ROLE_USER_PIC] as const;
export const ORGANIZATION_ALLOWED_ROLES = [ROLE_USER_PIC] as const;

export function getUserRole(user?: Pick<CurrentUser, "role"> | null): string {
    return String(user?.role ?? "").trim().toLowerCase();
}

export function hasRequiredRole(role: string, allowedRoles: readonly string[]): boolean {
    return allowedRoles.length === 0 || allowedRoles.includes(role);
}

export function canAccessOrganizationModules(user?: CurrentUser | null): boolean {
    return hasRequiredRole(getUserRole(user), ORGANIZATION_ALLOWED_ROLES);
}

export function requiresCompanyOnboarding(user?: CurrentUser | null): boolean {
    return getUserRole(user) === ROLE_USER_PIC && user?.hasCompany === false;
}

export function getDefaultAuthenticatedRoute(user?: CurrentUser | null): string {
    if (requiresCompanyOnboarding(user)) {
        return "/onboarding-perusahaan";
    }

    const role = getUserRole(user);
    if (role === ROLE_USER_PIC) {
        return "/dashboard";
    }

    return "/lms";
}
