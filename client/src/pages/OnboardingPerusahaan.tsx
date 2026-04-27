import { Building2, ArrowRight, Lock } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessOrganizationModules, requiresCompanyOnboarding } from "@/lib/access-control";

export default function OnboardingPerusahaan() {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);

    if (!currentUser) {
        return null;
    }

    if (!canAccessOrganizationModules(currentUser)) {
        return <Navigate to="/lms" replace />;
    }

    if (!requiresCompanyOnboarding(currentUser)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center p-6">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_28%)]" />
            <div className="relative w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.10)] p-8 md:p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25">
                    <Building2 className="h-8 w-8 text-white" />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-100">
                    <Lock className="h-3.5 w-3.5" />
                    Akses organisasi dikunci sementara
                </div>

                <h1 className="mt-5 text-2xl font-black text-slate-900">Lengkapi Data Perusahaan terlebih dahulu</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Akun PIC Anda sudah aktif, tetapi modul organisasi baru bisa digunakan setelah data perusahaan dilengkapi.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-left">
                    <p className="text-sm font-semibold text-slate-700">CTA</p>
                    <p className="mt-1 text-sm text-slate-500">Lengkapi Data Perusahaan terlebih dahulu</p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => navigate("/dashboard/profil?tab=perusahaan")}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700"
                    >
                        Lengkapi Data Perusahaan
                        <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => navigate("/lms")}
                        className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        Kembali ke LMS
                    </button>
                </div>
            </div>
        </div>
    );
}
