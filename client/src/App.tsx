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
import CoursePreview from "@/pages/CoursePreview";
import { LoadingScreen } from "@/components/LoadingScreen";

// Dashboard layout (App Shell – mounts once)
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Outlet } from "react-router-dom";

// Dashboard pages
import Dashboard from "@/pages/dashboard/Dashboard";
import IKAS from "@/pages/dashboard/IKAS";
import FormIkas from "@/pages/dashboard/FormIkas";
import KSE from "@/pages/dashboard/KSE";
import FormKse from "@/pages/dashboard/FormKse";
import CSIRT from "@/pages/dashboard/CSIRT";
import SurveiProfil from "@/pages/dashboard/SurveiProfil";
import EditProfil from "@/pages/dashboard/EditProfil";
import PengaturanAkun from "@/pages/dashboard/PengaturanAkun";
import { LMSLayout } from "@/features/lms/layouts/LMSLayout";
import { LMSDashboard } from "@/features/lms/pages/LMSDashboard";
import LMSMateri from "@/features/lms/pages/LMSMateri";
import { LMSProgress } from "@/features/lms/pages/LMSProgress";
import LMSCourse from "@/features/lms/pages/LMSCourse";
import LMSLearn from "@/features/lms/pages/LMSLearn";
import LMSQuiz from "@/features/lms/pages/LMSQuiz";
import LMSCertificate from "@/features/lms/pages/LMSCertificate";

// App Bootstrap function
import { bootstrapApp } from "@/lib/bootstrapApp";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";

// ── Data Router (required for useMatches / handle) ───────────────────────────
const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/mfa", element: <MfaVerify /> },
  { path: "/course-preview/:slug", element: <CoursePreview /> },

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
      { path: "/dashboard/pengaturan", element: <PengaturanAkun />, handle: { title: "Pengaturan Akun" } },
    ],
  },

  // LMS Module Layout
  {
    element: <LMSLayout />,
    children: [
      { path: "/lms", element: <LMSDashboard />, handle: { title: "Dashboard LMS" } },
      { path: "/lms/materi", element: <LMSMateri />, handle: { title: "Materi Pembelajaran" } },
      { path: "/lms/progress", element: <LMSProgress />, handle: { title: "Progress & Penilaian" } },
      {
        path: "/lms/materi/:courseId",
        element: <LMSCourse />,
        handle: { title: "Kelas Pembelajaran" },
        children: [
            { path: "learn/:materiId", element: <LMSLearn /> },
            { path: "quiz/:quizId", element: <LMSQuiz /> },
            { path: "certificate", element: <LMSCertificate /> },
        ]
      },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
]);

function App() {
  const isAppReady = useAppStore((state) => state.isAppReady);
  const setAppReady = useAppStore((state) => state.setAppReady);

  useEffect(() => {
    // Run bootstrapping sequence exactly once when the App mounts
    const initApp = async () => {
      await bootstrapApp();
      setAppReady(true);
    };

    initApp();
  }, [setAppReady]);

  // Jika app masih booting (ngecek auth/session API), jangan mount router/children sama sekali.
  // Ini menghindari component flash atau API call redudant yang disebabkan react tree setengah mount.
  if (!isAppReady) {
    return <LoadingScreen />;
  }

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
