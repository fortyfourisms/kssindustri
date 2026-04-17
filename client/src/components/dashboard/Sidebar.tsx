import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    Shield,
    Monitor,
    Users,
    ClipboardList,
    BookOpen,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import kssiLogo from "@/assets/KSSI.svg";
import fortyfourLogo from "@/assets/d44.svg";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "IKAS", href: "/dashboard/ikas", icon: Shield, description: "Instrumen Penilaian Kematangan Keamanan Siber" },
    { label: "KSE", href: "/dashboard/kse", icon: Monitor, description: "Kategorisasi Sistem Elektronik" },
    { label: "CSIRT", href: "/dashboard/csirt", icon: Users, description: "CSIRT" },
    { label: "Survei Profil Risiko", href: "/dashboard/survei", icon: ClipboardList },
    { label: "Materi", href: "/dashboard/materi", icon: BookOpen, description: "Materi Pembelajaran" },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const logout = useLogout();

    const NavContent = ({ forMobile = false }: { forMobile?: boolean }) => (
        <>
            {/* Logo */}
            <div className={cn("flex items-center py-5 border-b border-slate-100/80 px-4 overflow-x-hidden", !forMobile && collapsed ? "justify-center" : "")}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
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
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const active = location.pathname === item.href || (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={forMobile ? onClose : undefined}
                            title={!forMobile && collapsed ? item.label : ""}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                active
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-white" : "")} />
                            {(forMobile || !collapsed) && (
                                <span className="text-sm font-semibold truncate">{item.label}</span>
                            )}
                            {!active && !forMobile && collapsed && (
                                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            {(forMobile || !collapsed) && (
                <div className="px-2 pb-4 pt-2 border-t border-slate-100/80">
                    <button
                        onClick={() => logout.mutate()}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition group relative"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-semibold">Logout</span>
                    </button>
                </div>
            )}
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
                    "bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-xl shadow-slate-900/5",
                    collapsed ? "w-[72px]" : "w-64"
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
            <div className={cn("flex-shrink-0 transition-all duration-300 hidden md:block", collapsed ? "w-[72px]" : "w-64")} />
        </>
    );
}
