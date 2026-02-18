import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/utilisateurs": "Gestion des Utilisateurs",
  "/etudiants": "Gestion des Étudiants",
  "/formations": "Logiciels & Formations",
  "/inscriptions": "Inscriptions",
  "/emploi-du-temps": "Emplois du temps",
  "/paiements": "Paiements",
  "/parametres": "Paramètres",
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [session, loading, navigate]);

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar
        collapsed={isMobile ? false : !sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar
          title={pageTitle}
          onToggleSidebar={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
