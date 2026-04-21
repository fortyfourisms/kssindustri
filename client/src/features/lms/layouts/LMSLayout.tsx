import { useState } from "react";
import { Outlet, useMatches } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Topbar } from "@/components/dashboard/Topbar";
import { LMSSidebar } from "../components/LMSSidebar";

/** Route handle type – matches what we put on each Route in App.tsx */
interface RouteHandle {
    title?: string;
}

export function LMSLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Read the page title from the active route's handle
    const matches = useMatches();
    const title = (matches.at(-1)?.handle as RouteHandle | undefined)?.title;

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

                {/* LMS Sidebar */}
                <LMSSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main area - flush (padding applied per page) */}
                <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen">
                    {/* Topbar height is roughly 4rem (h-16) */}
                    <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
                    
                    <main className="flex-1 overflow-hidden relative">
                        <Outlet />
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
