import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MfaVerify from "@/pages/MfaVerify";
import NotFound from "@/pages/not-found";

// Dashboard layout (App Shell – mounts once)
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Dashboard pages
import Dashboard from "@/pages/dashboard/Dashboard";
import IKAS from "@/pages/dashboard/IKAS";
import FormIkas from "@/pages/dashboard/FormIkas";
import KSE from "@/pages/dashboard/KSE";
import FormKse from "@/pages/dashboard/FormKse";
import CSIRT from "@/pages/dashboard/CSIRT";
import SurveiProfil from "@/pages/dashboard/SurveiProfil";
import EditProfil from "@/pages/dashboard/EditProfil";
import LMS from "@/pages/dashboard/LMS";

// ── Data Router (required for useMatches / handle) ───────────────────────────
const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/mfa", element: <MfaVerify /> },

  // Dashboard App Shell – DashboardLayout mounts ONCE per session
  {
    element: <DashboardLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard />, handle: { title: "Dashboard" } },
      { path: "/dashboard/ikas", element: <IKAS />, handle: { title: "IKAS" } },
      { path: "/dashboard/form-ikas", element: <FormIkas />, handle: { title: "Input Data IKAS" } },
      { path: "/dashboard/kse", element: <KSE />, handle: { title: "KSE" } },
      { path: "/dashboard/form-kse", element: <FormKse />, handle: { title: "Form KSE" } },
      { path: "/dashboard/csirt", element: <CSIRT />, handle: { title: "CSIRT" } },
      { path: "/dashboard/survei", element: <SurveiProfil />, handle: { title: "Survei Profil Risiko" } },
      { path: "/dashboard/profil", element: <EditProfil />, handle: { title: "Profil" } },
      { path: "/dashboard/materi", element: <LMS />, handle: { title: "Materi Pembelajaran" } },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ShadcnToaster />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
