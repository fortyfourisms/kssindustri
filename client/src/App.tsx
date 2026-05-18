import { useEffect } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LMSLayout } from "@/features/lms/layouts/LMSLayout";
import { AuthGuard } from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import { ORGANIZATION_ALLOWED_ROLES } from "@/lib/access-control";
import { bootstrapApp } from "@/lib/bootstrapApp";
import { useAppStore } from "@/stores/useAppStore";
import { GlobalModalProvider } from "@/ui";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MfaVerify from "@/pages/MfaVerify";
import NotFound from "@/pages/not-found";
import CoursePreview from "@/pages/CoursePreview";
import Courses from "@/pages/Courses";
import Blogs from "@/pages/Blogs";
import BlogArticle from "@/pages/BlogArticle";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import OnboardingPerusahaan from "@/pages/OnboardingPerusahaan";

import Dashboard from "@/pages/dashboard/Dashboard";
import IKAS from "@/pages/dashboard/IKAS";
import FormIkas from "@/pages/dashboard/FormIkas";
import KSE from "@/pages/dashboard/KSE";
import FormKse from "@/pages/dashboard/FormKse";
import CSIRT from "@/pages/dashboard/CSIRT";
import SurveiProfil from "@/pages/dashboard/SurveiProfil";
import SurveiRisikoOverview from "@/pages/dashboard/SurveiRisikoOverview";
import EditProfil from "@/pages/dashboard/EditProfil";
import PengaturanAkun from "@/pages/dashboard/PengaturanAkun";

import { LMSDashboard } from "@/features/lms/pages/LMSDashboard";
import LMSMateri from "@/features/lms/pages/LMSMateri";
import { LMSProgress } from "@/features/lms/pages/LMSProgress";
import LMSCourse from "@/features/lms/pages/LMSCourse";
import LMSLearn from "@/features/lms/pages/LMSLearn";
import LMSQuiz from "@/features/lms/pages/LMSQuiz";
import LMSCertificate from "@/features/lms/pages/LMSCertificate";

function OrganizationRoute({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={ORGANIZATION_ALLOWED_ROLES} requireCompany>
      {children}
    </RoleGuard>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/mfa", element: <MfaVerify /> },
  { path: "/course-preview/:slug", element: <CoursePreview /> },
  { path: "/courses", element: <Courses /> },
  { path: "/blog", element: <Blogs /> },
  { path: "/blog/:slug", element: <BlogArticle /> },
  { path: "/events", element: <Events /> },
  { path: "/events/:eventSlug", element: <EventDetail /> },
  {
    path: "/onboarding-perusahaan",
    element: (
      <AuthGuard>
        <OnboardingPerusahaan />
      </AuthGuard>
    ),
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: (
          <OrganizationRoute>
            <Dashboard />
          </OrganizationRoute>
        ),
        handle: { title: "Dashboard" },
      },
      {
        path: "/perusahaan",
        element: (
          <OrganizationRoute>
            <EditProfil defaultTab="perusahaan" />
          </OrganizationRoute>
        ),
        handle: { title: "Data Perusahaan" },
      },
      {
        path: "/ikas",
        element: (
          <OrganizationRoute>
            <IKAS />
          </OrganizationRoute>
        ),
        handle: { title: "IKAS" },
      },
      {
        path: "/kse",
        element: (
          <OrganizationRoute>
            <KSE />
          </OrganizationRoute>
        ),
        handle: { title: "KSE" },
      },
      {
        path: "/csirt",
        element: (
          <OrganizationRoute>
            <CSIRT />
          </OrganizationRoute>
        ),
        handle: { title: "CSIRT" },
      },
      {
        path: "/survei-resiko",
        element: (
          <OrganizationRoute>
            <SurveiRisikoOverview />
          </OrganizationRoute>
        ),
        handle: { title: "Survei Risiko" },
      },
      {
        path: "/survei-resiko/form",
        element: (
          <OrganizationRoute>
            <SurveiProfil />
          </OrganizationRoute>
        ),
        handle: { title: "Form Survei Risiko" },
      },
      {
        path: "/dashboard/ikas",
        element: <Navigate to="/ikas" replace />,
      },
      {
        path: "/dashboard/kse",
        element: <Navigate to="/kse" replace />,
      },
      {
        path: "/dashboard/csirt",
        element: <Navigate to="/csirt" replace />,
      },
      {
        path: "/dashboard/survei",
        element: <Navigate to="/survei-resiko" replace />,
      },
      {
        path: "/dashboard/form-ikas",
        element: (
          <OrganizationRoute>
            <FormIkas />
          </OrganizationRoute>
        ),
        handle: { title: "Input Data IKAS" },
      },
      {
        path: "/dashboard/form-kse",
        element: (
          <OrganizationRoute>
            <FormKse />
          </OrganizationRoute>
        ),
        handle: { title: "Form KSE" },
      },
      { path: "/dashboard/profil", element: <EditProfil />, handle: { title: "Profil" } },
      { path: "/dashboard/pengaturan", element: <PengaturanAkun />, handle: { title: "Pengaturan Akun" } },
    ],
  },
  {
    element: <LMSLayout />,
    children: [
      { path: "/lms", element: <LMSDashboard />, handle: { title: "Pembelajaran Saya" } },
      { path: "/lms/courses", element: <LMSMateri />, handle: { title: "Daftar Kelas" } },
      { path: "/lms/materi", element: <Navigate to="/lms/courses" replace /> },
      { path: "/lms/progress", element: <LMSProgress />, handle: { title: "Progress Belajar" } },
      {
        path: "/course/:courseId",
        element: <LMSCourse />,
        handle: { title: "Kelas Pembelajaran" },
        children: [
          { path: "learn/:materiId", element: <LMSLearn /> },
          { path: "quiz/:quizId", element: <LMSQuiz /> },
          { path: "certificate", element: <LMSCertificate /> },
        ],
      },
      {
        path: "/lms/materi/:courseId",
        element: <LMSCourse />,
        handle: { title: "Kelas Pembelajaran" },
        children: [
          { path: "learn/:materiId", element: <LMSLearn /> },
          { path: "quiz/:quizId", element: <LMSQuiz /> },
          { path: "certificate", element: <LMSCertificate /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function App() {
  const isAppReady = useAppStore((state) => state.isAppReady);
  const setAppReady = useAppStore((state) => state.setAppReady);
  const dashboardTheme = useAppStore((state) => state.dashboardTheme);

  useEffect(() => {
    const initApp = async () => {
      await bootstrapApp();
      setAppReady(true);
    };

    initApp();
  }, [setAppReady]);

  useEffect(() => {
    document.documentElement.dataset.theme = dashboardTheme;
    document.documentElement.dataset.dashboardTheme = dashboardTheme;
    document.body.dataset.theme = dashboardTheme;
    document.body.dataset.dashboardTheme = dashboardTheme;
  }, [dashboardTheme]);

  if (!isAppReady) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalModalProvider>
          <Toaster />
          <ShadcnToaster />
          <RouterProvider router={router} />
        </GlobalModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
