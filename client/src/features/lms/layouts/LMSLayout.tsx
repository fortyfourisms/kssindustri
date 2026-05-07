import { useEffect, useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { AuthGuard } from "@/components/ProtectedRoute";
import { Topbar } from "@/components/dashboard/Topbar";
import { LMSSidebar } from "../components/LMSSidebar";
import { useAppStore } from "@/stores/useAppStore";

/** Route handle type – matches what we put on each Route in App.tsx */
interface RouteHandle {
    title?: string;
}

export function LMSLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dashboardTheme = useAppStore((state) => state.dashboardTheme);

    // Read the page title from the active route's handle
    const matches = useMatches();
    const title = (matches.at(-1)?.handle as RouteHandle | undefined)?.title;

    useEffect(() => {
        // LMS should always render in light mode even when the dashboard preference is dark.
        document.documentElement.dataset.theme = "light";
        document.documentElement.dataset.dashboardTheme = "light";
        document.body.dataset.theme = "light";
        document.body.dataset.dashboardTheme = "light";

        return () => {
            document.documentElement.dataset.theme = dashboardTheme;
            document.documentElement.dataset.dashboardTheme = dashboardTheme;
            document.body.dataset.theme = dashboardTheme;
            document.body.dataset.dashboardTheme = dashboardTheme;
        };
    }, [dashboardTheme]);

    return (
        <AuthGuard>
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

                {/* LMS Sidebar */}
                <LMSSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main area - flush (padding applied per page) */}
                <div className="flex-1 flex min-h-screen min-w-0 flex-col relative z-10">
                    {/* Topbar height is roughly 4rem (h-16) */}
                    <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} hideThemeToggle />
                    
                    <main className="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
