import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import { AdminLayout } from "./components/layout/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import StudentsPage from "./pages/StudentsPage";
import FormationsPage from "./pages/FormationsPage";
import InscriptionsPage from "./pages/InscriptionsPage";
import PaiementsPage from "./pages/PaiementsPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import DepensePage from "./pages/DepensePage";
import PrestationsPage from "./pages/PrestationsPage";
import InventairesPage from "./pages/InventairesPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/utilisateurs" element={<UsersPage />} />
              <Route path="/etudiants" element={<StudentsPage />} />
              <Route path="/logiciels" element={<FormationsPage />} />
              <Route path="/inscriptions" element={<InscriptionsPage />} />
              <Route path="/emploi-du-temps" element={<SchedulePage />} />
              <Route path="/paiements" element={<PaiementsPage />} />
              <Route path="/depenses" element={<DepensePage />} />
              <Route path="/prestations" element={<PrestationsPage />} />
              <Route path="/inventaires" element={<InventairesPage />} />
              <Route path="/parametres" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
