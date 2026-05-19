import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  Sparkles,
  MessageSquare,
  CalendarDays,
  LogOut,
  Menu,
  Video,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CrmSocketListener } from '@/components/crm-socket-listener';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/authSlice';
import type { UserRole } from '@/store/authSlice';
import {
  fetchMainLeadOnLandScheduleByDay,
  fetchVentorScheduleByDay,
} from '@/features/schedule/store/scheduleSlice';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  labelKey: string;
  icon: LucideIcon;
  roles?: UserRole[];
  physicalOnly?: boolean;
}

/** Bottom bar on mobile — main destinations only. */
const bottomBarNavItems: NavItem[] = [
  { path: '/', labelKey: 'layout.navHome', icon: LayoutDashboard },
  { path: '/projects', labelKey: 'layout.navProjects', icon: Building2 },
  { path: '/clients', labelKey: 'layout.navClients', icon: Users },
  { path: '/profile', labelKey: 'layout.navProfile', icon: User },
];

/** Full sidebar (desktop + mobile drawer) — same list for both. */
const sidebarNavItems: NavItem[] = [
  ...bottomBarNavItems,
  { path: '/training-sessions', labelKey: 'layout.navTrainingSessions', icon: Video },
  {
    path: '/schedule',
    labelKey: 'layout.navAgenda',
    icon: CalendarDays,
    roles: ['asesor_fisico', 'admin', 'main_lead'],
  },
  { path: '/assistant', labelKey: 'layout.navAssistant', icon: Sparkles },
  { path: '/whatsapp', labelKey: 'layout.navWhatsapp', icon: MessageSquare, physicalOnly: true },
];

interface LayoutProps {
  children: React.ReactNode;
}

function filterNavItems(
  items: NavItem[],
  user: { physical?: boolean } | null | undefined,
  userRole: UserRole | undefined,
): NavItem[] {
  return items.filter((item) => {
    if (item.physicalOnly && !user?.physical) return false;
    if (item.roles && (!userRole || !item.roles.includes(userRole))) return false;
    return true;
  });
}

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const userRole = user?.role as UserRole | undefined;
  const [menuOpen, setMenuOpen] = useState(false);

  const todayYmd = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const scheduleNavEligible = Boolean(
    userRole &&
      (userRole === 'asesor_fisico' || userRole === 'admin' || userRole === 'main_lead'),
  );
  const todayPendingCount = useAppSelector(
    (s) => (s.schedule.byDay[todayYmd] ?? []).filter((e) => e.status === 'pending').length,
  );

  useEffect(() => {
    if (!scheduleNavEligible) return;
    if (userRole === 'main_lead') {
      void dispatch(fetchMainLeadOnLandScheduleByDay(todayYmd));
      return;
    }
    void dispatch(fetchVentorScheduleByDay(todayYmd));
  }, [dispatch, scheduleNavEligible, todayYmd, userRole]);

  const filteredBottomBar = filterNavItems(bottomBarNavItems, user, userRole);
  const filteredSidebar = filterNavItems(sidebarNavItems, user, userRole);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const renderNavLink = (item: NavItem, onNavigate?: () => void) => {
    const isActive = location.pathname === item.path;
    const showAgendaBadge = item.path === '/schedule' && todayPendingCount > 0;
    const label = t(item.labelKey);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive
            ? 'gradient-commission text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        <span className="flex-1">{label}</span>
        {showAgendaBadge ? (
          <Badge
            variant="destructive"
            className="h-5 min-w-5 px-1.5 text-[10px] tabular-nums"
            aria-label={t('layout.badgeVisitsToday', { count: todayPendingCount })}
          >
            {todayPendingCount > 99 ? '99+' : todayPendingCount}
          </Badge>
        ) : null}
      </Link>
    );
  };

  const renderSidebarBrand = () => (
    <motion.div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-foreground">
          La<span className="text-primary">Ceiba</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t('layout.panelSubtitle')}</p>
      </div>
      <LanguageSwitcher />
    </motion.div>
  );

  const renderSidebarFooter = () => (
    <div className="space-y-3 border-t border-border pt-4">
      {user ? (
        <motion.div className="px-3">
          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </motion.div>
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200 w-full cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        {t('layout.logout')}
      </button>
    </div>
  );

  const renderSidebarNav = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 overflow-y-auto min-h-0">
      {filteredSidebar.map((item) => renderNavLink(item, onNavigate))}
    </nav>
  );

  const renderMobileTab = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const label = t(item.labelKey);
    return (
      <Link
        key={item.path}
        to={item.path}
        className="relative flex flex-col items-center py-2 px-3 cursor-pointer"
      >
        {isActive ? (
          <motion.div
            layoutId="activeTab"
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-commission"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        ) : null}
        <item.icon
          className={`w-5 h-5 transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <span
          className={`text-[10px] mt-1 font-medium ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <motion.div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      <CrmSocketListener />
      <div className="fixed top-2 right-2 z-50 md:hidden">
        <LanguageSwitcher />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border z-40 p-6">
        {renderSidebarBrand()}
        <div className="flex-1 flex flex-col min-h-0 mt-6 px-0">
          {renderSidebarNav()}
        </div>
        {renderSidebarFooter()}
      </aside>

      {/* Mobile bottom bar — main items + menu */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 px-2 py-1">
        <div className="flex items-center justify-around">
          {filteredBottomBar.map((item) => renderMobileTab(item))}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="relative flex flex-col items-center py-2 px-3 cursor-pointer"
                aria-label={t('layout.navMenu')}
              >
                <Menu
                  className={`w-5 h-5 transition-colors duration-200 ${
                    menuOpen ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    menuOpen ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {t('layout.navMenu')}
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-2rem,16rem)] flex flex-col p-0">
              <SheetHeader className="px-6 pt-6 pb-2 text-left">
                <SheetTitle className="sr-only">{t('layout.menuDrawerTitle')}</SheetTitle>
                {renderSidebarBrand()}
              </SheetHeader>
              <div className="flex-1 flex flex-col min-h-0 px-3">
                {renderSidebarNav(() => setMenuOpen(false))}
              </div>
              <div className="px-3 pb-6">{renderSidebarFooter()}</div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

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
    </motion.div>
  );
};

export default Layout;
