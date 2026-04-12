import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  CreditCard,
  ScrollText,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/contracts', label: 'Contracts', icon: ScrollText },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/kyc', label: 'KYC', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function SidebarNav({ items, pathname, onNavClick }) {
  return (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      {items.map((item) => {
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

export default function DistributorLayout() {
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
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rentr-primary/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rentr-primary/5 blur-[160px] rounded-full" />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen border-r border-foreground/[0.08] bg-background/80 backdrop-blur-xl flex-col sticky top-0 z-50">
        <div className="px-6 py-6 border-b border-foreground/[0.06]">
          <Logo size="sm" />
          <p className="mt-1 text-[8px] tracking-[0.4em] text-rentr-primary/60 font-bold uppercase">Distributor</p>
        </div>

        <SidebarNav items={navItems} pathname={location.pathname} />

        <div className="border-t border-foreground/[0.06] p-4 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full border border-foreground/[0.08] bg-rentr-primary/10 flex items-center justify-center text-xs font-bold text-rentr-primary shrink-0">
              {(user?.name || user?.email || 'D').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">{user?.name || user?.email || 'Distributor'}</p>
              <p className="text-[9px] text-foreground/25 uppercase tracking-widest">{user?.company_name || 'Partner'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/25 hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-300"
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
          <button className="text-foreground/40 hover:text-foreground" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <SidebarNav items={navItems} pathname={location.pathname} onNavClick={() => setMobileOpen(false)} />
      </aside>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <header className="h-16 lg:h-[72px] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-foreground/[0.06]">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-foreground/40 hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
              <span className="text-foreground/15">Distributor</span>
              <span className="text-foreground/10">/</span>
              <span className="text-foreground/50">{getCurrentPageName(location.pathname)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.03] transition-all group"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-foreground/30 group-hover:text-rentr-primary transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-foreground/30 group-hover:text-rentr-primary transition-colors" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl border border-foreground/[0.06] flex items-center justify-center hover:bg-red-500/5 transition-all group"
            >
              <LogOut className="w-4 h-4 text-foreground/30 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </header>

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
