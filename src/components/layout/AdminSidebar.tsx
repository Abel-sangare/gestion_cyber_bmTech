import {
  LayoutDashboard,
  Users,
  GraduationCap,
  MonitorSmartphone,
  ClipboardList,
  Calendar,
  CreditCard,
  Wallet,
  BarChart3,
  Briefcase,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Utilisateurs", icon: Users, to: "/utilisateurs" },
  { label: "Étudiants", icon: GraduationCap, to: "/etudiants" },
  { label: "Logiciels", icon: MonitorSmartphone, to: "/logiciels" },
  { label: "Inscriptions", icon: ClipboardList, to: "/inscriptions" },
  { label: "Emplois du temps", icon: Calendar, to: "/emploi-du-temps" },
  { label: "Paiements", icon: CreditCard, to: "/paiements" },
  { label: "Dépenses", icon: Wallet, to: "/depenses" },
  { label: "Prestations", icon: Briefcase, to: "/prestations" },
  { label: "Inventaires", icon: BarChart3, to: "/inventaires" },
  { label: "Paramètres", icon: Settings, to: "/parametres" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, mobileOpen, onMobileClose }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 md:relative md:z-auto",
        collapsed ? "w-[70px]" : "w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
          BM
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            BMTech
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50">© 2024 BMTech</p>
        </div>
      )}
    </aside>
  );
}
