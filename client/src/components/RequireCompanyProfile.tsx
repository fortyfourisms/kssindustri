import { useUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { perusahaanService } from "@/services/perusahaan.service";
import { useLocation } from "wouter";
import { Building2, Lock, ArrowRight } from "lucide-react";

export function isCompanyEmpty(p: any): boolean {
    // If no company data exists at all
    if (!p) return true;

    // Company must have a name at minimum.
    // If it has a username but no nama_perusahaan, it's actually the user object (false positive guard)
    if (!p.nama_perusahaan) return true;

    // Consider company "incomplete" if critical contact fields are missing
    return !p.alamat || !p.email || !p.telepon;
}

interface RequireCompanyProfileProps {
    children: React.ReactNode;
}

/**
 * Wraps dashboard feature pages. If company profile is incomplete,
 * shows a lock screen instead of the page content.
 *
 * Strategy:
 * 1. Get the logged-in user data from /api/me.
 * 2. If user has an id_perusahaan (or nested perusahaan.id), fetch the company data.
 * 3. Only show the lock modal if the company data is truly empty/incomplete.
 *    Users who have already filled in company profile pass through immediately.
 */
export function RequireCompanyProfile({ children }: RequireCompanyProfileProps) {
    const [, navigate] = useLocation();

    const { data: meData, isLoading: isUserLoading } = useUser();

    // Resolve the company ID from nested or flat user data
    const perusahaanId = meData?.id_perusahaan || meData?.perusahaan?.id;

    // Fetch the full company data only when we have an ID
    const { data: perusahaan, isLoading: isPerusahaanLoading } = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => perusahaanService.getById(String(perusahaanId)),
        enabled: !!perusahaanId,
        staleTime: 1000 * 60 * 5,
    });

    // While loading either the user or company data, render children to avoid flicker
    if (isUserLoading || (!!perusahaanId && isPerusahaanLoading)) {
        return <>{children}</>;
    }

    // If user has no company linked at all, OR the company data is incomplete → show lock
    const companyData = perusahaan ?? meData?.perusahaan ?? null;
    if (!perusahaanId || isCompanyEmpty(companyData)) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                {/* Modal Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-900/20 p-8 max-w-sm w-full flex flex-col items-center text-center gap-4 border border-white/60 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Lock className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/40 ring-2 ring-white text-white">
                            <Building2 className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <div className="mt-2">
                        <h2 className="text-xl font-black text-slate-900 mb-2">Lengkapi Data Perusahaan</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Anda belum bisa mengakses fitur ini. Silakan lengkapi <strong className="text-slate-800">data perusahaan</strong> terlebih dahulu.
                        </p>
                    </div>

                    <div className="flex flex-col w-full gap-2 mt-4">
                        <button
                            onClick={() => navigate("/dashboard/profil?tab=perusahaan")}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            Isi Data Perusahaan
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full py-2.5 rounded-xl bg-transparent text-slate-500 font-bold text-sm hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        >
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
