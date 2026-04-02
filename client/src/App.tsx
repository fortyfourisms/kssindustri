import { Switch, Route } from "wouter";
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

// Dashboard pages
import Dashboard from "@/pages/dashboard/Dashboard";
import IKAS from "@/pages/dashboard/IKAS";
import FormIkas from "@/pages/dashboard/FormIkas";
import KSE from "@/pages/dashboard/KSE";
import FormKse from "@/pages/dashboard/FormKse";
import CSIRT from "@/pages/dashboard/CSIRT";
import SurveiProfil from "@/pages/dashboard/SurveiProfil";
import EditProfil from "@/pages/dashboard/EditProfil";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/mfa" component={MfaVerify} />

      {/* Protected dashboard (each page wraps itself in DashboardLayout > ProtectedRoute) */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/ikas" component={IKAS} />
      <Route path="/dashboard/form-ikas" component={FormIkas} />
      <Route path="/dashboard/kse" component={KSE} />
      <Route path="/dashboard/form-kse" component={FormKse} />
      <Route path="/dashboard/csirt" component={CSIRT} />
      <Route path="/dashboard/survei" component={SurveiProfil} />
      <Route path="/dashboard/profil" component={EditProfil} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ShadcnToaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
