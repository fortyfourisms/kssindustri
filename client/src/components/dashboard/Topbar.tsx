import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, UserCircle, User, Menu, Settings, Moon, Sun } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { cn, getMediaUrl } from "@/lib/utils";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useAppStore } from "@/stores/useAppStore";

interface TopbarProps {
    title?: string;
    onMenuClick?: () => void;
    hideThemeToggle?: boolean;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function Topbar({ title, onMenuClick, hideThemeToggle = false }: TopbarProps) {
    const { data: user } = useUser();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dashboardTheme = useAppStore((state) => state.dashboardTheme);
    const toggleDashboardTheme = useAppStore((state) => state.toggleDashboardTheme);
    const isDark = dashboardTheme === "dark";

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
            style={{
                background: "var(--dashboard-topbar-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--dashboard-topbar-border)",
                boxShadow: "var(--dashboard-topbar-shadow)",
            }}
        >
            {/* Left: Hamburger + Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="rounded-xl p-2 transition lg:hidden"
                    style={{ color: "var(--dashboard-text-muted)" }}
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                {title && (
                    <div className="flex items-center gap-2">
                        <div
                            className="hidden h-5 w-1 rounded-full sm:block"
                            style={{
                                background: "linear-gradient(180deg, var(--dashboard-title-accent-start), var(--dashboard-title-accent-end))",
                            }}
                        />
                        <h2 className="text-base font-black tracking-tight" style={{ color: "var(--dashboard-text)" }}>{title}</h2>
                    </div>
                )}
            </div>

            {/* Right: Notifications + Avatar dropdown */}
            <div className="flex items-center gap-2">
                {!hideThemeToggle && (
                    <button
                        type="button"
                        onClick={toggleDashboardTheme}
                        className="relative flex h-10 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition"
                        style={{
                            borderColor: "var(--dashboard-border)",
                            background: "var(--dashboard-surface)",
                            color: "var(--dashboard-text-soft)",
                        }}
                        aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
                        title={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4" style={{ color: "var(--dashboard-status-warning)" }} />
                        ) : (
                            <Moon className="h-4 w-4" style={{ color: "var(--dashboard-text-soft)" }} />
                        )}
                        <span className="hidden lg:inline">{isDark ? "Light" : "Dark"}</span>
                    </button>
                )}

                <NotificationBell />

                <div className="w-px h-6 mx-1 hidden sm:block" style={{ background: "var(--dashboard-topbar-border)" }} />

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className={cn(
                            "flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 transition-all duration-200",
                            open
                                ? "ring-1"
                                : ""
                        )}
                        style={{
                            background: open ? "var(--dashboard-surface-muted)" : "transparent",
                            borderColor: "var(--dashboard-border)",
                        }}
                    >
                        {/* Avatar */}
                        <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold ring-2"
                            style={{
                                background: "linear-gradient(135deg, var(--dashboard-avatar-start), var(--dashboard-avatar-end))",
                                boxShadow: "var(--dashboard-avatar-shadow)",
                                borderColor: "var(--dashboard-border)",
                                color: "var(--dashboard-nav-active-fg)",
                            }}
                        >
                            {user?.foto_profile ? (
                                <img src={getMediaUrl(user.foto_profile)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name ? getInitials(user.name) : <User className="w-3.5 h-3.5" />
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold leading-none" style={{ color: "var(--dashboard-text)" }}>{user?.username ?? user?.name}</p>
                            <p className="text-[10px] mt-0.5 truncate max-w-[140px]" style={{ color: "var(--dashboard-text-muted)" }}>{user?.email}</p>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open ? "rotate-180" : "")} style={{ color: "var(--dashboard-text-muted)" }} />
                    </button>

                    {/* Dropdown */}
                    {open && (
                        <div
                            className="absolute right-0 mt-2 w-56 rounded-2xl py-1.5 z-50 overflow-hidden"
                            style={{
                                background: "var(--dashboard-surface-strong)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid var(--dashboard-border)",
                                boxShadow: "var(--dashboard-card-shadow)",
                            }}
                        >
                            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--dashboard-border)" }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dashboard-text-muted)" }}>Masuk sebagai</p>
                                <p className="text-sm font-black truncate mt-0.5" style={{ color: "var(--dashboard-text)" }}>{user?.username ?? user?.name}</p>
                                <p className="text-[10px] truncate" style={{ color: "var(--dashboard-text-muted)" }}>{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <Link
                                    to="/dashboard/profil"
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--dashboard-card-chip)]"
                                    style={{ color: "var(--dashboard-text-soft)" }}
                                >
                                    <div
                                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors group-hover:bg-[var(--dashboard-action-soft-icon-hover)]"
                                        style={{ background: "var(--dashboard-action-soft-icon-bg)" }}
                                    >
                                        <UserCircle className="h-4 w-4" style={{ color: "var(--dashboard-action-soft-icon-fg)" }} />
                                    </div>
                                    <span className="font-semibold">Profil Saya</span>
                                </Link>
                                <Link
                                    to="/dashboard/pengaturan"
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--dashboard-card-chip)]"
                                    style={{ color: "var(--dashboard-text-soft)" }}
                                >
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ background: "var(--dashboard-card-chip)" }}>
                                        <Settings className="w-4 h-4 transition-colors" style={{ color: "var(--dashboard-text-muted)" }} />
                                    </div>
                                    <span className="font-semibold">Pengaturan Akun</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
