import { useState, type CSSProperties } from "react";
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
import { useAuthStore } from "@/stores/auth.store";
import { getUserRole, ROLE_USER } from "@/lib/access-control";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { getCoursesRoute } from "@/features/lms/lib/lms-routes";
import kssiLogo from "@/assets/KSSI.svg";
import fortyfourLogo from "@/assets/d44.svg";

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

type NavTone = "primary" | "info" | "violet" | "success" | "warning" | "learning";

const NAV_TONES: Record<string, NavTone> = {
    "/dashboard": "primary",
    "/ikas": "info",
    "/kse": "violet",
    "/csirt": "success",
    "/survei-resiko": "warning",
    "/lms": "learning",
    "/lms/courses": "learning",
};

function getNavToneVars(tone: NavTone): CSSProperties {
    return {
        ["--dashboard-nav-start" as string]: `var(--dashboard-nav-${tone}-start)`,
        ["--dashboard-nav-end" as string]: `var(--dashboard-nav-${tone}-end)`,
        ["--dashboard-nav-icon" as string]: `var(--dashboard-nav-${tone}-icon)`,
        ["--dashboard-nav-shadow-value" as string]: `var(--dashboard-nav-${tone}-shadow)`,
    };
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const location = useLocation();
    const logout = useLogout();
    const currentUser = useAuthStore((state) => state.currentUser);
    const role = getUserRole(currentUser);

    const navItems = role === ROLE_USER
        ? [
            { label: "LMS / My Learning", href: "/lms", icon: BookOpen },
            { label: "Courses", href: getCoursesRoute(), icon: LayoutDashboard },
        ]
        : [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "IKAS", href: "/ikas", icon: Shield },
            { label: "KSE", href: "/kse", icon: Monitor },
            { label: "CSIRT", href: "/csirt", icon: Users },
            { label: "Survei Risiko", href: "/survei-resiko", icon: ClipboardList },
            { label: "LMS", href: "/lms", icon: BookOpen },
        ];

    const NavContent = ({ forMobile = false }: { forMobile?: boolean }) => (
        <>
            {/* Logo */}
            <div className={cn(
                "flex items-center py-5 px-4 overflow-x-hidden",
                "border-b",
                !forMobile && collapsed ? "justify-center" : ""
            )} style={{ borderColor: "var(--dashboard-sidebar-border)" }}>
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{
                            background: "linear-gradient(135deg, var(--dashboard-logo-start), var(--dashboard-logo-end))",
                            boxShadow: "var(--dashboard-logo-shadow)",
                        }}
                    >
                        <img src={fortyfourLogo} alt="FORTYFOUR" className="h-5 w-auto object-contain brightness-200" />
                    </div>
                    {(forMobile || !collapsed) && (
                        <div className="overflow-hidden">
                            <img src={kssiLogo} alt="KSSI" className="kssi-logo h-6 w-auto object-contain" />
                        </div>
                    )}
                </div>
                {/* Mobile close button */}
                {forMobile && (
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 rounded-lg transition"
                        style={{ color: "var(--dashboard-text-muted)" }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Nav label */}
            {(forMobile || !collapsed) && (
                <p className="px-4 pt-5 pb-2 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--dashboard-text-muted)" }}>
                    Menu Utama
                </p>
            )}

            {/* Nav */}
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const active = location.pathname === item.href || (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
                    const Icon = item.icon;
                    const tone = NAV_TONES[item.href] ?? "primary";
                    const navToneVars = getNavToneVars(tone);

                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={forMobile ? onClose : undefined}
                            title={!forMobile && collapsed ? item.label : ""}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                !active && "hover:bg-[var(--dashboard-sidebar-hover)]"
                            )}
                            style={
                                active
                                    ? {
                                        ...navToneVars,
                                        background: "linear-gradient(135deg, var(--dashboard-nav-start), var(--dashboard-nav-end))",
                                        boxShadow: "var(--dashboard-nav-shadow-value)",
                                        color: "var(--dashboard-nav-active-fg)",
                                    }
                                    : {
                                        ...navToneVars,
                                        color: "var(--dashboard-sidebar-text)",
                                    }
                            }
                        >
                            <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all"
                                style={{
                                    background: active ? "var(--dashboard-nav-active-chip)" : "var(--dashboard-card-chip)",
                                    color: active ? "var(--dashboard-nav-active-fg)" : "var(--dashboard-nav-icon)",
                                }}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            {(forMobile || !collapsed) && (
                                <div className="flex-1 min-w-0">
                                    <span className="block truncate text-sm font-semibold transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                            )}
                            {active && (forMobile || !collapsed) && (
                                <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "var(--dashboard-nav-active-indicator)" }} />
                            )}
                            {/* Tooltip when collapsed */}
                            {!active && !forMobile && collapsed && (
                                <div className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-xl border" style={{ background: "var(--dashboard-surface-strong)", color: "var(--dashboard-text)", borderColor: "var(--dashboard-border)" }}>
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Divider */}
            <div className="mx-4 border-t" style={{ borderColor: "var(--dashboard-sidebar-border)" }} />

            {/* Bottom Actions */}
            <div className="px-2 py-4">
                <button
                    onClick={() => setShowLogoutDialog(true)}
                    disabled={logout.isPending}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                        "text-[var(--dashboard-nav-danger-fg)] hover:bg-[var(--dashboard-nav-danger-bg)] hover:text-[var(--dashboard-nav-danger-fg-hover)]",
                        logout.isPending && "opacity-60 cursor-not-allowed"
                    )}
                >
                    <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-[var(--dashboard-nav-danger-bg-hover)]"
                        style={{ background: "var(--dashboard-card-chip)" }}
                    >
                        <LogOut className="w-4 h-4" />
                    </div>
                    {(forMobile || !collapsed) && (
                        <span className="text-sm font-semibold">Logout</span>
                    )}
                </button>
            </div>

            <LogoutConfirmDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
                onConfirm={() => logout.mutate()}
                isPending={logout.isPending}
                description="Anda yakin ingin keluar dari akun ini? Anda perlu login kembali untuk mengakses dashboard."
            />
        </>
    );

    return (
        <>
            {/* ── MOBILE DRAWER ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 backdrop-blur-sm transition-all duration-300 lg:hidden"
                    style={{ background: "var(--dashboard-overlay)" }}
                    onClick={onClose}
                />
            )}

            {/* Mobile slide-in sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 flex h-screen flex-col overflow-hidden transition-transform duration-300 lg:hidden",
                    "border-r shadow-2xl",
                    "w-[min(20rem,calc(100vw-1rem))]",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{
                    background: "var(--dashboard-sidebar-bg)",
                    borderColor: "var(--dashboard-sidebar-border)",
                    paddingTop: "env(safe-area-inset-top)",
                    paddingBottom: "env(safe-area-inset-bottom)",
                }}
            >
                <NavContent forMobile />
            </aside>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 hidden h-screen flex-col overflow-hidden transition-all duration-300 lg:flex",
                    "border-r shadow-2xl",
                    collapsed ? "w-[72px]" : "w-64"
                )}
                style={{
                    background: "var(--dashboard-sidebar-bg)",
                    borderColor: "var(--dashboard-sidebar-border)",
                    boxShadow: "var(--dashboard-sidebar-shadow)",
                }}
            >
                <NavContent />

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 border shadow-xl rounded-full flex items-center justify-center transition z-50"
                    style={{
                        background: "var(--dashboard-surface-strong)",
                        borderColor: "var(--dashboard-border)",
                        color: "var(--dashboard-text-muted)",
                    }}
                    title={collapsed ? "Buka Sidebar" : "Kecilkan Sidebar"}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </aside>

            {/* Desktop Spacer */}
            <div className={cn("hidden flex-shrink-0 transition-all duration-300 lg:block", collapsed ? "w-[72px]" : "w-64")} />
        </>
    );
}
