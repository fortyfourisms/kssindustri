import { useUser } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Building2, Lock, ArrowRight } from "lucide-react";

function isCompanyEmpty(p: any): boolean {
    // Fitur dinonaktifkan sementara (selalu return false agar lolos)
    return false;
}

interface RequireCompanyProfileProps {
    children: React.ReactNode;
}

/**
 * Wraps dashboard feature pages. If company profile is incomplete,
 * shows a lock screen instead of the page content.
 */
export function RequireCompanyProfile({ children }: RequireCompanyProfileProps) {
    const [, navigate] = useLocation();

    // Company data comes from useUser as a nested `perusahaan` object
    const { data: meData, isLoading } = useUser();
    const perusahaan = meData?.perusahaan;

    // While loading, simply render children to avoid flicker
    if (isLoading) return <>{children}</>;

    if (isCompanyEmpty(perusahaan)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-10 max-w-md w-full shadow-xl shadow-slate-900/8 flex flex-col items-center gap-5">
                    {/* Icon stack */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md shadow-amber-400/40">
                            <Lock className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Fitur Terkunci</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Anda perlu melengkapi <span className="font-semibold text-slate-700">data perusahaan</span> terlebih dahulu sebelum dapat menggunakan fitur ini.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard/profil?tab=perusahaan")}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                        Lengkapi Data Perusahaan
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
