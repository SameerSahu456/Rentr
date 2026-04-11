import { motion } from "motion/react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ArrowRight,
  Laptop,
  Smartphone,
  Camera,
  Monitor,
  Tag as TagIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { 
    id: "INV-001", 
    name: "MacBook Pro M3 Max", 
    category: "Computing", 
    status: "Available", 
    price: "$450/mo", 
    icon: Laptop,
    tags: ["High-End", "M3 Max", "32GB RAM"]
  },
  { 
    id: "INV-002", 
    name: "Sony A7R V", 
    category: "Photography", 
    status: "Rented", 
    price: "$320/mo", 
    icon: Camera,
    tags: ["61MP", "Full Frame", "Professional"]
  },
  { 
    id: "INV-003", 
    name: "iPhone 15 Pro", 
    category: "Mobile", 
    status: "Available", 
    price: "$120/mo", 
    icon: Smartphone,
    tags: ["Titanium", "A17 Pro", "5G"]
  },
  { 
    id: "INV-004", 
    name: "Pro Display XDR", 
    category: "Computing", 
    status: "Maintenance", 
    price: "$600/mo", 
    icon: Monitor,
    tags: ["6K", "HDR", "Reference"]
  },
  { 
    id: "INV-005", 
    name: "iPad Pro 12.9\"", 
    category: "Mobile", 
    status: "Available", 
    price: "$180/mo", 
    icon: Smartphone,
    tags: ["M2", "Liquid Retina", "Pencil Support"]
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
};

export function ListView({ onItemClick }: { onItemClick: (id: string) => void }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-12 space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Inventory Management</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Asset Registry
          </motion.h1>
        </div>
        
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input 
              type="text" 
              placeholder="FILTER ASSETS" 
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-64"
            />
          </div>
          <button className="p-3 rounded-full bg-foreground/[0.02] border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all shadow-lg shadow-rentr-primary/20">
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </motion.div>
      </div>

      {/* List Table */}
      <div className="border-t border-foreground/[0.05]">
        <div className="grid grid-cols-12 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 border-b border-foreground/[0.05]">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Asset Name</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-3">Tags</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-foreground/[0.03]">
          {items.map((asset) => (
            <motion.div 
              key={asset.id}
              variants={itemVariants}
              onClick={() => onItemClick(asset.id)}
              className="grid grid-cols-12 px-6 py-8 items-center group hover:bg-foreground/[0.01] transition-all cursor-pointer"
            >
              <div className="col-span-1 text-[10px] font-mono text-foreground/20 group-hover:text-rentr-primary transition-colors">
                {asset.id.split('-')[1]}
              </div>
              
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <asset.icon className="w-5 h-5 text-foreground/40 group-hover:text-rentr-primary transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform duration-500">{asset.name}</h4>
                  <p className="text-[10px] text-foreground/20 uppercase tracking-widest mt-1">{asset.price}</p>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{asset.category}</span>
              </div>

              <div className="col-span-3 flex flex-wrap gap-2">
                {asset.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-foreground/[0.03] border border-foreground/[0.05] text-[9px] font-bold uppercase tracking-wider text-foreground/40 group-hover:border-rentr-primary/20 group-hover:text-rentr-primary/60 transition-all">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="col-span-1">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                  asset.status === "Available" ? "text-emerald-500 bg-emerald-500/5" : 
                  asset.status === "Rented" ? "text-amber-500 bg-amber-500/5" : "text-red-500 bg-red-500/5"
                )}>
                  <div className={cn("w-1 h-1 rounded-full", asset.status === "Available" ? "bg-emerald-500" : asset.status === "Rented" ? "bg-amber-500" : "bg-red-500")} />
                  {asset.status}
                </div>
              </div>

              <div className="col-span-1 text-right">
                <button className="p-2 rounded-full text-foreground/10 hover:text-rentr-primary hover:bg-rentr-primary/5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer / Pagination */}
      <div className="flex items-center justify-between pt-8 border-t border-foreground/[0.05]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
          Showing 5 of 142 Assets
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, "...", 12].map((p, i) => (
            <button 
              key={i}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                p === 1 ? "bg-rentr-primary text-white" : "text-foreground/20 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
