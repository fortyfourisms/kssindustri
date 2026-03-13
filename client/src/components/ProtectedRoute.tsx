import { useAuthStore } from "@/stores/auth.store";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute — guards dashboard pages using the Zustand auth store.
 * Reads `authenticated` from sessionStorage-persisted state (instant, no network request).
 * Redirects to /login if not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const authenticated = useAuthStore((s) => s.authenticated);
    const currentUser = useAuthStore((s) => s.currentUser);
    const [, navigate] = useLocation();

    // _hydrated becomes true after Zustand persist middleware restores state.
    // We use a simple boolean: if authenticated is false AND currentUser is null
    // after Zustand has had a chance to hydrate, we redirect.
    useEffect(() => {
        if (!authenticated) {
            navigate("/login");
        }
    }, [authenticated, navigate]);

    if (!authenticated || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground text-sm">Memverifikasi sesi...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
