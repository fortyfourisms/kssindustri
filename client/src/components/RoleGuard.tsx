import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { getUserRole, hasRequiredRole, requiresCompanyOnboarding } from "@/lib/access-control";
import { toast } from "sonner";

interface RoleGuardProps {
    children: React.ReactNode;
    allow: readonly string[];
    redirectTo?: string;
    denyMessage?: string;
    requireCompany?: boolean;
}

export function RoleGuard({
    children,
    allow,
    redirectTo = "/lms",
    denyMessage = "Anda tidak memiliki akses ke halaman ini",
    requireCompany = false,
}: RoleGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = useAuthStore((state) => state.currentUser);
    const hasRedirectedRef = useRef(false);

    const role = getUserRole(currentUser);
    const hasRoleAccess = hasRequiredRole(role, allow);
    const mustCompleteCompany = requireCompany && requiresCompanyOnboarding(currentUser);

    useEffect(() => {
        if (hasRedirectedRef.current || !currentUser) return;

        if (!hasRoleAccess) {
            hasRedirectedRef.current = true;
            toast.error(denyMessage);
            navigate(redirectTo, {
                replace: true,
                state: { from: location.pathname },
            });
            return;
        }

        if (mustCompleteCompany) {
            hasRedirectedRef.current = true;
            navigate("/onboarding-perusahaan", {
                replace: true,
                state: { from: location.pathname },
            });
        }
    }, [currentUser, denyMessage, hasRoleAccess, location.pathname, mustCompleteCompany, navigate, redirectTo]);

    if (!currentUser || !hasRoleAccess || mustCompleteCompany) {
        return null;
    }

    return <>{children}</>;
}
