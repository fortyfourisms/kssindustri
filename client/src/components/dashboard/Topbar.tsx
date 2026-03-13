import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { ChevronDown, UserCircle, User } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface TopbarProps {
    title?: string;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function Topbar({ title }: TopbarProps) {
    const { data: user } = useUser();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100/80 bg-white/60 backdrop-blur-xl sticky top-0 z-30">
            {/* Title */}
            <div>
                {title && (
                    <h2 className="text-lg font-black text-slate-900 font-display">{title}</h2>
                )}
            </div>

            {/* Right: Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center gap-2.5 rounded-2xl px-3 py-1.5 hover:bg-slate-100 transition"
                >
                    {/* Avatar circle */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25 flex-shrink-0">
                        {user?.name ? getInitials(user.name) : <User className="w-4 h-4" />}
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-slate-800 leading-none">{user?.username}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform",
                            open ? "rotate-180" : ""
                        )}
                    />
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl shadow-slate-900/10 py-1 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-xs font-semibold text-slate-500">Masuk sebagai</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.username ?? user?.name}</p>
                        </div>
                        <Link
                            href="/dashboard/profil"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition w-full"
                        >
                            <UserCircle className="w-4 h-4" />
                            Edit Profil
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
