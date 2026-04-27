import { useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { AuthGuard } from "@/components/ProtectedRoute";

interface RouteHandle {
    title?: string;
}

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const matches = useMatches();
    const title = (matches.at(-1)?.handle as RouteHandle | undefined)?.title;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#f5f7ff] flex">
                <div
                    className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        background: `
              radial-gradient(80% 60% at 10% 10%, rgba(89,92,255,0.05) 0%, transparent 60%),
              radial-gradient(70% 60% at 90% 90%, rgba(0,97,255,0.04) 0%, transparent 60%)
            `,
                    }}
                />

                <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 relative z-10">
                    <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
