import { motion } from "motion/react";
import { 
  TrendingUp, 
  Package, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Laptop,
  Smartphone,
  Camera,
  Monitor,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Revenue", value: "$124.5k", change: "+12.5%", trending: "up" },
  { label: "Rentals", value: "842", change: "+5.2%", trending: "up" },
  { label: "Assets", value: "2,419", change: "-1.4%", trending: "down" },
  { label: "Clients", value: "156", change: "+18.3%", trending: "up" },
];

const recentRentals = [
  { id: "REN-9021", client: "Alex Rivera", item: "MacBook Pro M3 Max", date: "2 mins ago", status: "Active", amount: "$450", icon: Laptop },
  { id: "REN-9020", client: "Sarah Chen", item: "Sony A7R V + 24-70mm", date: "15 mins ago", status: "Pending", amount: "$820", icon: Camera },
  { id: "REN-9019", client: "Marcus Thorne", item: "iPhone 15 Pro (x5)", date: "1 hour ago", status: "Shipped", amount: "$1,200", icon: Smartphone },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

export function Dashboard() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen grid-lines"
    >
      {/* Hero Section */}
      <section className="px-12 pt-12 pb-24 border-b border-foreground/[0.05]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <motion.div variants={item} className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-rentr-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Real-time Overview</span>
            </motion.div>
            <motion.h1 variants={item} className="text-7xl md:text-9xl font-brand font-black tracking-[-0.06em] leading-[0.85] text-gradient">
              TECH RENTALS<br />SIMPLIFIED.
            </motion.h1>
          </div>
          <motion.div variants={item} className="flex flex-col gap-4 items-start md:items-end">
            <p className="text-sm text-foreground/40 font-serif italic max-w-[240px] md:text-right leading-relaxed">
              Managing high-end technology assets with precision and elegance.
            </p>
            <button className="group flex items-center gap-3 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500">
              New Rental
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-foreground/[0.05]">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label} 
            variants={item}
            className={cn(
              "p-12 flex flex-col gap-8 group hover:bg-foreground/[0.02] transition-colors duration-700",
              i < 3 && "border-r border-foreground/[0.05]"
            )}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">{stat.label}</span>
              <div className={cn(
                "text-[10px] font-bold",
                stat.trending === "up" ? "text-emerald-500" : "text-red-500"
              )}>
                {stat.change}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 border-r border-foreground/[0.05] p-12">
          <motion.div variants={item} className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-brand font-black uppercase tracking-tight text-foreground">Recent Activity</h2>
            <button className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors">View Archive</button>
          </motion.div>
          
          <div className="space-y-1">
            {recentRentals.map((rental, i) => (
              <motion.div 
                key={rental.id} 
                variants={item}
                className="group flex items-center gap-8 py-6 border-b border-foreground/[0.03] last:border-none hover:px-4 transition-all duration-500"
              >
                <span className="text-[10px] font-mono text-foreground/10 group-hover:text-rentr-primary transition-colors">0{i + 1}</span>
                <div className="w-12 h-12 rounded-full bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center group-hover:bg-rentr-primary/10 group-hover:border-rentr-primary/20 transition-all duration-500">
                  <rental.icon className="w-5 h-5 text-foreground/20 group-hover:text-rentr-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform duration-500">{rental.item}</h4>
                  <p className="text-[10px] text-foreground/20 uppercase tracking-widest mt-1">{rental.client} • {rental.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{rental.amount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/20 mt-1">{rental.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-12 flex flex-col gap-12">
          <motion.div variants={item}>
            <h2 className="text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">System Health</h2>
            <div className="space-y-8">
              {[
                { label: "Computing", value: 88 },
                { label: "Photography", value: 64 },
                { label: "Mobile", value: 92 },
              ].map((cat) => (
                <div key={cat.label} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-foreground/20">{cat.label}</span>
                    <span className="text-foreground">{cat.value}%</span>
                  </div>
                  <div className="h-[1px] w-full bg-foreground/[0.05] relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute inset-y-0 left-0 bg-rentr-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="mt-auto p-8 rounded-3xl bg-foreground/[0.02] border border-foreground/[0.05] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rentr-primary/10 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-rentr-primary/20 transition-colors duration-700" />
            <p className="text-[10px] font-bold text-rentr-primary uppercase tracking-[0.3em] mb-4">Inventory Alert</p>
            <p className="text-xs text-foreground/40 leading-relaxed font-serif italic">
              "MacBook Pro M3 inventory is reaching critical levels. Restock recommended within 48 hours."
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
