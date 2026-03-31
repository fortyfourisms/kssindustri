import { useAuthStore } from "@/stores/auth.store";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute — guards dashboard pages via HTTP-only cookie session.
 *
 * Alur:
 * 1. Setiap kali komponen di-mount (refresh, tab baru, navigasi pertama),
 *    panggil GET /api/me dengan cookie yang ada (credentials: 'include').
 * 2. Jika server merespons valid → hydrate Zustand store (in-memory) → render.
 * 3. Jika server merespons 401 / error → redirect ke /login.
 *
 * Tidak ada localStorage atau sessionStorage yang digunakan untuk auth state.
 * Sumber kebenaran satu-satunya adalah HTTP-only cookie + server.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const authenticated = useAuthStore((s) => s.authenticated);
    const currentUser = useAuthStore((s) => s.currentUser);
    const rehydrateFromServer = useAuthStore((s) => s.rehydrateFromServer);
    const [, navigate] = useLocation();

    // Mulai dengan verifying=true — SELALU cek ke server saat mount
    const [isVerifying, setIsVerifying] = useState(true);
    // Guard untuk React Strict Mode double-invoke
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        // Jika store sudah ter-hydrate di render ini (navigasi antar halaman
        // dalam tab yang sama tanpa unmount), skip network call.
        if (authenticated && currentUser) {
            setIsVerifying(false);
            return;
        }

        // Tanya server: apakah cookie masih valid?
        rehydrateFromServer().then((ok) => {
            if (!ok) {
                navigate("/login");
            }
            setIsVerifying(false);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground text-sm">Memverifikasi sesi...</p>
                </div>
            </div>
        );
    }

    // Verifikasi selesai tapi gagal — redirect sedang berlangsung
    if (!authenticated || !currentUser) {
        return null;
    }

    return <>{children}</>;
}
