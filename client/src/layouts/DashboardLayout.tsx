import { useEffect, useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { AuthGuard } from "@/components/ProtectedRoute";
import { useUser } from "@/hooks/useAuth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useNotificationStream } from "@/hooks/useNotifications";
import { useAppStore } from "@/stores/useAppStore";

interface RouteHandle {
    title?: string;
}

export function DashboardLayout() {
    return (
        <AuthGuard>
            <DashboardLayoutContent />
        </AuthGuard>
    );
}

function DashboardLayoutContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const matches = useMatches();
    const title = (matches.at(-1)?.handle as RouteHandle | undefined)?.title;
    const dashboardTheme = useAppStore((state) => state.dashboardTheme);
    const { data: user } = useUser();
    useCompanyProfile(user);
    useNotificationStream(true);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    return (
        <div
            className="dashboard-shell relative flex min-h-screen overflow-x-clip"
            data-theme={dashboardTheme}
            data-dashboard-theme={dashboardTheme}
            style={{ background: "var(--dashboard-bg)" }}
        >
            {/* Multi-layer ambient background */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    background: `
              radial-gradient(ellipse 70% 45% at 15% 5%, var(--dashboard-bg-layer-a) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 90% 90%, var(--dashboard-bg-layer-b) 0%, transparent 55%),
              var(--dashboard-bg)
            `,
                }}
            />
            {/* Subtle dot grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.018]"
                style={{
                    backgroundImage: `radial-gradient(circle, var(--dashboard-grid-dot) 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }}
            />

            <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-clip overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
