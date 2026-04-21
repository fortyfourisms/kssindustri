import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    BookOpen,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
    TrendingUp,
    ArrowLeft,
    CheckCircle2,
    ClipboardList,
    Lock,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import kssiLogo from "@/assets/KSSI.svg";
import fortyfourLogo from "@/assets/d44.svg";
import { computeProgress, useLmsStore } from "@/features/lms/stores/lms.store";

const navItems = [
    { label: "Dashboard LMS", href: "/lms", icon: LayoutDashboard },
    { label: "Materi", href: "/lms/materi", icon: BookOpen, description: "Materi Pembelajaran" },
    { label: "Progress / Penilaian", href: "/lms/progress", icon: TrendingUp },
];

interface LMSSidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export function LMSSidebar({ mobileOpen = false, onClose }: LMSSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const logout = useLogout();
    const navigate = useNavigate();
    const { courseMateri, courseQuizzes, completedMateriIds } = useLmsStore();

    const isCoursePlayerRoute = location.pathname.startsWith("/lms/materi/") && !collapsed;
    const sortedMateri = useMemo(() => [...courseMateri].sort((a, b) => a.urutan - b.urutan), [courseMateri]);
    const progressPercentage = computeProgress(sortedMateri, completedMateriIds);
    const desktopSidebarWidth = isCoursePlayerRoute ? "w-[320px]" : "w-64";

    const NavContent = ({ forMobile = false }: { forMobile?: boolean }) => (
        <>
            {/* Logo */}
            <div className={cn("flex items-center py-5 border-b border-slate-100/80 px-5 overflow-x-hidden", !forMobile && collapsed ? "justify-center" : "")}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-lg shadow-blue-500/15 flex-shrink-0">
                        <img src={fortyfourLogo} alt="FORTYFOUR" className="h-6 w-auto object-contain" />
                    </div>
                    {(forMobile || !collapsed) && (
                        <div className="overflow-hidden">
                            <img src={kssiLogo} alt="KSSI" className="h-6 w-auto object-contain" />
                        </div>
                    )}
                </div>
                {/* Mobile close button */}
                {forMobile && (
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 overflow-y-auto overflow-x-hidden">
                <div className="space-y-2">
                {navItems.map((item) => {
                    // Exact match for /lms to prevent it from matching /lms/materi
                    const active = item.href === "/lms" 
                        ? location.pathname === "/lms" 
                        : location.pathname.startsWith(item.href);
                        
                    const Icon = item.icon;
                    return (
                        <div key={item.href}>
                            <NavLink
                                to={item.href}
                                onClick={forMobile ? onClose : undefined}
                                title={!forMobile && collapsed ? item.label : ""}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                                    active
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-white" : "")} />
                                {(forMobile || !collapsed) && (
                                    <span className="text-sm font-semibold truncate flex-1">{item.label}</span>
                                )}
                                {!active && !forMobile && collapsed && (
                                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>

                            {item.href === "/lms/materi" && isCoursePlayerRoute && (forMobile || !collapsed) && (
                                <div className="mt-3 ml-4 border-l border-slate-200 pl-4 pr-1">
                                    <div className="max-h-[calc(100vh-20rem)] overflow-y-auto session-scrollbar pr-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-[11px] font-black text-slate-400 tracking-[0.22em] uppercase">Table of Contents</div>
                                            <span className="text-[11px] font-bold text-slate-400">{sortedMateri.length}</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            {sortedMateri.map((materi, idx) => {
                                                const isDone = completedMateriIds.has(materi.id);
                                                const prevDone = idx === 0 || completedMateriIds.has(sortedMateri[idx - 1].id);
                                                const isLocked = !prevDone;
                                                const linkedQuizzes = courseQuizzes.filter((q) => q.id_materi === materi.id).sort((a, b) => a.urutan - b.urutan);
                                                const isActive = location.pathname.includes(`/learn/${materi.id}`);

                                                return (
                                                    <div key={materi.id} className="space-y-2">
                                                        {isLocked ? (
                                                            <div className="w-full px-2 py-2.5 text-left opacity-75">
                                                                <div className="flex items-start gap-3">
                                                                    <Lock className="mt-1 w-4 h-4 shrink-0 text-slate-400" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="block text-sm font-semibold text-slate-600 line-clamp-2">{materi.judul}</span>
                                                                        <p className="mt-1 text-[11px] font-medium text-slate-400">Terkunci</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    navigate(`/lms/materi/${materi.id_kelas}/learn/${materi.id}`);
                                                                    if (forMobile) onClose?.();
                                                                }}
                                                                className={cn(
                                                                    "w-full px-2 py-2.5 text-left transition-all group rounded-lg",
                                                                    isActive
                                                                        ? "bg-blue-50 text-blue-700"
                                                                        : "hover:bg-slate-100/80"
                                                                )}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    {isDone ? (
                                                                        <CheckCircle2 className="mt-1 w-4 h-4 shrink-0 text-teal-500" />
                                                                    ) : (
                                                                        <BookOpen className={cn("mt-1 w-4 h-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div className="min-w-0">
                                                                                <span className={cn("block text-sm tracking-tight line-clamp-2", isActive ? "text-blue-700 font-bold" : isDone ? "text-slate-700" : "text-slate-800 font-semibold")}>
                                                                                    {materi.judul}
                                                                                </span>
                                                                                <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                                                                    <span>Lesson {idx + 1}</span>
                                                                                    {materi.tipe === "video" && materi.durasi_detik && (
                                                                                        <>
                                                                                            <span>/</span>
                                                                                            <span>{Math.ceil(materi.durasi_detik / 60)} menit</span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {isActive && (
                                                                                <span className="mt-0.5 inline-flex rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 border border-blue-100">
                                                                                    Aktif
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        )}

                                                        {linkedQuizzes.map((kuis) => (
                                                            <button
                                                                key={kuis.id}
                                                                onClick={() => {
                                                                    if (!isLocked && isDone) {
                                                                        navigate(`/lms/materi/${kuis.id_kelas}/quiz/${kuis.id}`);
                                                                        if (forMobile) onClose?.();
                                                                    }
                                                                }}
                                                                disabled={isLocked || !isDone}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 px-2 py-2 ml-4 text-left transition-all group rounded-lg",
                                                                    isLocked || !isDone ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-50/70"
                                                                )}
                                                            >
                                                                {isLocked || !isDone ? <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ClipboardList className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                                                <span className={cn("text-[12px] font-semibold flex-1 min-w-0 line-clamp-2", isLocked || !isDone ? "text-slate-500" : "text-slate-700 group-hover:text-amber-700")}>
                                                                    Kuis: {kuis.judul}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })}

                                            {(() => {
                                                const unlinkedQuizzes = courseQuizzes.filter((q) => !q.id_materi).sort((a, b) => a.urutan - b.urutan);
                                                if (unlinkedQuizzes.length === 0) return null;
                                                const isFinalLocked = progressPercentage < 100;
                                                return (
                                                    <div className="mt-3 space-y-1.5">
                                                        {unlinkedQuizzes.map((kuis) => (
                                                            <button
                                                                key={kuis.id}
                                                                disabled={isFinalLocked}
                                                                onClick={() => {
                                                                    if (!isFinalLocked) {
                                                                        navigate(`/lms/materi/${kuis.id_kelas}/quiz/${kuis.id}`);
                                                                        if (forMobile) onClose?.();
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 px-2 py-2 text-left transition-all group rounded-lg",
                                                                    isFinalLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-50/70"
                                                                )}
                                                            >
                                                                {isFinalLocked ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                                                                <span className={cn("text-sm font-bold flex-1 min-w-0 line-clamp-2", isFinalLocked ? "text-slate-500" : "text-amber-900")}>
                                                                    Final: {kuis.judul}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            </nav>

            {/* Bottom Actions */}
            <div className={cn("px-3 pb-4 pt-3 border-t border-slate-100/80", (!forMobile && collapsed) ? "flex flex-col items-center" : "")}>
                <div className="space-y-2">
                <button
                    onClick={() => navigate("/dashboard")}
                    title={!forMobile && collapsed ? "Kembali ke Dashboard Utama" : ""}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition group relative",
                        !forMobile && collapsed ? "justify-center px-0" : ""
                    )}
                >
                    <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                    {(forMobile || !collapsed) && (
                        <span className="text-sm font-semibold truncate">Ke Dashboard Utama</span>
                    )}
                </button>
                {(forMobile || !collapsed) && (
                    <button
                        onClick={() => logout.mutate()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition group relative"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-semibold">Logout</span>
                    </button>
                )}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* ── MOBILE DRAWER ── */}
            {/* Overlay backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile slide-in sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300 md:hidden",
                    "bg-white/95 backdrop-blur-xl border-r border-white/50 shadow-2xl",
                    "w-72",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <NavContent forMobile />
            </aside>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen z-40 flex-col transition-all duration-300 hidden md:flex",
                    "bg-[#f8fafc]/92 backdrop-blur-xl border-r border-white/60 shadow-xl shadow-slate-900/5",
                    collapsed ? "w-[72px]" : desktopSidebarWidth
                )}
            >
                <NavContent />

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200/80 shadow-md shadow-slate-900/5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition z-50"
                    title={collapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </aside>

            {/* Desktop Spacer */}
            <div className={cn("flex-shrink-0 transition-all duration-300 hidden md:block", collapsed ? "w-[72px]" : desktopSidebarWidth)} />
        </>
    );
}
