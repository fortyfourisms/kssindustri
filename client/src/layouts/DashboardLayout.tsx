import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Building2, ArrowRight, X } from "lucide-react";

const COMPANY_CHECK_KEY = "company_prompt_shown";

function isCompanyEmpty(p: any): boolean {
    if (!p) return true;
    // Consider company "incomplete" if alamat, email, telepon are all missing
    return !p.alamat && !p.email && !p.telepon;
}

function CompanyModal({ onClose, onGo }: { onClose: () => void; onGo: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            {/* Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-900/20 p-8 max-w-sm w-full flex flex-col items-center text-center gap-4 border border-white/60">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                    <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900 mb-1">Lengkapi Data Perusahaan Anda</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Profil perusahaan Anda belum lengkap. Silakan isi informasi perusahaan agar semua fitur dapat berjalan optimal.
                    </p>
                </div>
                <button
                    onClick={onGo}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                    Lengkapi Sekarang
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 transition mt-1">
                    Nanti saja
                </button>
            </div>
        </div>
    );
}

function CompanyGuard() {
    const [, navigate] = useLocation();
    const [showModal, setShowModal] = useState(false);
    const checked = useRef(false);

    // Company data comes from useUser (which includes a nested `perusahaan` object, if backend supports it)
    const { data: meData, isSuccess } = useUser();

    useEffect(() => {
        if (!isSuccess || checked.current) return;
        checked.current = true;
        const alreadyShown = sessionStorage.getItem(COMPANY_CHECK_KEY);
        // Check the nested perusahaan from /api/me response
        const perusahaan = meData?.perusahaan ?? meData;
        if (!alreadyShown && isCompanyEmpty(perusahaan)) {
            sessionStorage.setItem(COMPANY_CHECK_KEY, "1");
            setShowModal(true);
        }
    }, [isSuccess, meData]);

    const handleGo = () => {
        setShowModal(false);
        navigate("/dashboard/profil?tab=perusahaan");
    };

    if (!showModal) return null;
    return <CompanyModal onClose={() => setShowModal(false)} onGo={handleGo} />;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#f5f7ff] flex">
                {/* Background gradient */}
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        background: `
              radial-gradient(80% 60% at 10% 10%, rgba(89,92,255,0.05) 0%, transparent 60%),
              radial-gradient(70% 60% at 90% 90%, rgba(0,97,255,0.04) 0%, transparent 60%)
            `,
                    }}
                />

                {/* Sidebar */}
                <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Company incomplete guard – shows modal once per session */}
                <CompanyGuard />

                {/* Main area */}
                <div className="flex-1 flex flex-col min-w-0 relative z-10">
                    <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

