import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, User, Sparkles, MessageSquare, CalendarDays, LogOut } from "lucide-react";
import { CrmSocketListener } from "@/components/crm-socket-listener";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/authSlice";
import type { UserRole } from "@/store/authSlice";
import { motion } from "framer-motion";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  physicalOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { path: "/", label: "Inicio", icon: LayoutDashboard },
  { path: "/projects", label: "Proyectos", icon: Building2 },
  { path: "/clients", label: "Clientes", icon: Users },
  { path: "/schedule", label: "Agenda", icon: CalendarDays, roles: ["asesor_fisico", "admin"] },
  { path: "/assistant", label: "Asistente", icon: Sparkles },
  { path: "/whatsapp", label: "WhatsApp", icon: MessageSquare, physicalOnly: true },
  { path: "/profile", label: "Perfil", icon: User },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const userRole = user?.role as UserRole | undefined;

  console.log({user});

  const navItems = allNavItems.filter((item) => {
    if (item.physicalOnly && !user?.physical) return false;
    if (item.roles && (!userRole || !item.roles.includes(userRole))) return false;
    return true;
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      <CrmSocketListener />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border z-40">
        <div className="p-6">
          <h1 className="text-xl font-extrabold text-foreground">
            La<span className="text-primary">Ceiba</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Panel de Vendedores</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "gradient-commission text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-3">
          {user && (
            <div className="px-3">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 px-2 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 px-3"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-commission"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
