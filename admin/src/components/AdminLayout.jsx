import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Logo, RentrIcon } from './Logo';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CreditCard,
  ScrollText,
  Users,
  HardDrive,
  RotateCcw,
  BarChart3,
  LifeBuoy,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  DollarSign,
  FileBarChart,
  Shield,
  History,
  Truck,
  ArrowRightLeft,
  Wallet,
  Wrench,
  Building2,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/assets', label: 'Assets', icon: HardDrive },
  {
    label: 'Accounts',
    icon: Wallet,
    children: [
      { to: '/invoices', label: 'Invoices', icon: FileText },
      { to: '/payments', label: 'Payments', icon: CreditCard },
      { to: '/billing', label: 'Billing', icon: DollarSign },
      { to: '/contracts', label: 'Contracts', icon: ScrollText },
    ],
  },
  {
    label: 'Operations',
    icon: Wrench,
    children: [
      { to: '/logistics', label: 'Logistics', icon: Truck },
      { to: '/returns', label: 'Returns', icon: RotateCcw },
      { to: '/replacements', label: 'Replacements', icon: ArrowRightLeft },
    ],
  },
  { to: '/distributors', label: 'Distributors', icon: Building2 },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { to: '/users', label: 'Users', icon: Shield },
      { to: '/audit-trail', label: 'Audit Trail', icon: History },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function isGroupActive(group, pathname) {
  return group.children?.some(
    (child) => pathname === child.to || pathname.startsWith(child.to + '/')
  );
}

function SidebarNav({ items, pathname, onNavClick }) {
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    items.forEach((item) => {
      if (item.children && isGroupActive(item, pathname)) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      {items.map((item) => {
        if (item.children) {
          const groupActive = isGroupActive(item, pathname);
          const isOpen = openGroups[item.label] || groupActive;

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 w-full group',
                  groupActive
                    ? 'text-rentr-primary'
                    : 'text-foreground/25 hover:text-foreground/60'
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 ml-auto transition-transform duration-300',
                    isOpen ? 'rotate-180' : ''
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-3 border-l border-foreground/[0.06] space-y-0.5 py-1">
                      {item.children.map((child) => {
                        const childActive =
                          pathname === child.to ||
                          (child.to !== '/' && pathname.startsWith(child.to + '/'));

                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={onNavClick}
                            className={cn(
                              'relative flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300',
                              childActive
                                ? 'text-rentr-primary bg-rentr-primary/8'
                                : 'text-foreground/25 hover:text-foreground/60 hover:bg-foreground/[0.02]'
                            )}
                          >
                            <child.icon className="w-4 h-4 shrink-0" />
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        const isActive =
          item.to === '/'
            ? pathname === '/'
            : pathname === item.to || pathname.startsWith(item.to + '/');

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={cn(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-500 group',
              isActive
                ? 'text-rentr-primary'
                : 'text-foreground/25 hover:text-foreground/60'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-nav-bg"
                className="absolute inset-0 bg-rentr-primary/8 rounded-xl border border-rentr-primary/15"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className="w-[18px] h-[18px] relative z-10 shrink-0" />
            <span className="relative z-10">{item.label}</span>
            {isActive && (
              <ChevronRight className="w-3.5 h-3.5 ml-auto relative z-10 text-rentr-primary/50" />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden selection:bg-rentr-primary/30 selection:text-white">
      {/* Luxury Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rentr-primary/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rentr-primary/5 blur-[160px] rounded-full" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen border-r border-foreground/[0.08] bg-background/80 backdrop-blur-xl flex-col sticky top-0 z-50">
        {/* Logo area */}
        <div className="px-6 py-6 border-b border-foreground/[0.06]">
          <Logo size="sm" />
        </div>

        <SidebarNav items={navItems} pathname={location.pathname} />

        {/* Bottom section */}
        <div className="border-t border-foreground/[0.06] p-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full border border-foreground/[0.08] bg-rentr-primary/10 flex items-center justify-center text-xs font-bold text-rentr-primary shrink-0">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">{user?.name || user?.email || 'Admin'}</p>
              <p className="text-[9px] text-foreground/25 uppercase tracking-widest">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/25 hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-300 border border-transparent hover:border-red-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed lg:hidden inset-y-0 left-0 z-50 w-72 bg-background/95 backdrop-blur-xl border-r border-foreground/[0.08] flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/[0.06]">
          <Logo size="sm" />
          <button
            className="text-foreground/40 hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <SidebarNav
          items={navItems}
          pathname={location.pathname}
          onNavClick={() => setMobileOpen(false)}
        />

        <div className="px-3 py-4 border-t border-foreground/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/25 hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-300 border border-transparent hover:border-red-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 lg:h-[72px] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-foreground/[0.06]">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-foreground/40 hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
              <span className="text-foreground/15">Rentr</span>
              <span className="text-foreground/10">/</span>
              <span className="text-foreground/50">{getCurrentPageName(location.pathname)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {/* Search */}
            <div className="relative group hidden md:flex items-center border border-foreground/[0.06] rounded-xl px-3 py-2 hover:border-foreground/[0.1] focus-within:border-rentr-primary/30 transition-colors">
              <Search className="w-3.5 h-3.5 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none py-0 pl-2 pr-2 text-xs focus:outline-none w-32 focus:w-48 transition-all placeholder:text-foreground/15 text-foreground"
              />
            </div>

            <div className="h-6 w-[1px] bg-foreground/[0.06] hidden lg:block" />

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 rounded-xl border border-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.03] hover:border-foreground/[0.1] transition-all group"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-foreground/30 group-hover:text-rentr-primary transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rentr-primary rounded-full" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.03] hover:border-foreground/[0.1] transition-all group"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-foreground/30 group-hover:text-rentr-primary transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-foreground/30 group-hover:text-rentr-primary transition-colors" />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl border border-foreground/[0.06] flex items-center justify-center hover:bg-red-500/5 hover:border-red-500/15 transition-all group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-foreground/30 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </header>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 p-4 lg:p-6 xl:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function getCurrentPageName(pathname) {
  if (pathname === '/') return 'Dashboard';
  const segment = pathname.split('/')[1];
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
