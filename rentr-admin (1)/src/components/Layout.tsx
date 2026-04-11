import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  Menu,
  Sun,
  Moon
} from "lucide-react";
import { Logo, RentrIcon } from "./Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Package, label: "Inventory", id: "inventory" },
  { icon: Users, label: "Clients", id: "clients" },
  { icon: Calendar, label: "Rentals", id: "rentals" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export function Sidebar({ active, onActiveChange }: { active: string; onActiveChange: (id: string) => void }) {
  return (
    <aside className="w-20 h-screen border-r border-foreground/[0.05] bg-background flex flex-col items-center py-8 sticky top-0 z-50">
      <div className="mb-12">
        <RentrIcon size="sm" />
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onActiveChange(item.id)}
              className={cn(
                "relative p-3 rounded-full transition-all duration-500 group",
                isActive ? "text-rentr-primary" : "text-foreground/20 hover:text-foreground/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-rentr-primary/10 rounded-full border border-rentr-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-foreground/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap shadow-xl">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-6 items-center">
        <button className="p-3 rounded-full text-foreground/20 hover:text-foreground/60 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full border border-foreground/10 p-0.5 overflow-hidden">
          <img 
            src="https://picsum.photos/seed/admin/100/100" 
            alt="User" 
            className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ theme, onThemeToggle, onLogout }: { theme: "dark" | "light"; onThemeToggle: () => void; onLogout: () => void }) {
  return (
    <header className="h-24 px-12 flex items-center justify-between sticky top-0 z-40 bg-background/50 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Logo size="sm" />
        <div className="h-4 w-[1px] bg-foreground/10" />
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
          <span className="text-foreground/20">Admin</span>
          <span className="text-foreground/10">/</span>
          <span className="text-foreground">Overview</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH" 
            className="bg-transparent border-none py-2 pl-8 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none w-40 focus:w-64 transition-all placeholder:text-foreground/10"
          />
        </div>
        
        <div className="flex items-center gap-2 border-l border-foreground/10 pl-6">
          <button 
            onClick={onThemeToggle}
            className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center hover:bg-foreground/5 transition-colors group"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-foreground/40 group-hover:text-rentr-primary transition-colors" />
            ) : (
              <Moon className="w-4 h-4 text-foreground/40 group-hover:text-rentr-primary transition-colors" />
            )}
          </button>
          
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center hover:bg-red-500/10 transition-colors group"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-foreground/40 group-hover:text-red-500 transition-colors" />
          </button>

          <button className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center hover:bg-foreground/5 transition-colors">
            <Menu className="w-5 h-5 text-foreground/40" />
          </button>
        </div>
      </div>
    </header>
  );
}
