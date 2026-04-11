import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Calendar, 
  Shield, 
  History,
  Tag as TagIcon,
  X,
  Plus,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function DetailView({ id, onBack }: { id: string; onBack: () => void }) {
  const [tags, setTags] = useState(["High-End", "M3 Max", "32GB RAM", "Space Black", "Enterprise"]);
  const [newTag, setNewTag] = useState("");

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      {/* Top Navigation */}
      <div className="px-12 py-8 border-b border-foreground/[0.05] flex items-center justify-between sticky top-24 bg-background/80 backdrop-blur-xl z-30">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Registry
        </button>

        <div className="flex items-center gap-4">
          <button className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all">
            <Edit3 className="w-4 h-4" />
            Edit Asset
          </button>
        </div>
      </div>

      <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Media & Primary Info */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-1 rounded bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
                    Computing
                  </span>
                  <span className="text-[10px] font-mono text-foreground/20">{id}</span>
                </div>
                <h1 className="text-7xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
                  MacBook Pro M3 Max
                </h1>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 mb-1">Monthly Rate</p>
                <p className="text-4xl font-brand font-black text-rentr-primary">$450.00</p>
              </div>
            </div>

            <div className="aspect-video rounded-[3rem] bg-foreground/[0.02] border border-foreground/[0.05] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 grid-lines opacity-50" />
              <Laptop className="w-48 h-48 text-foreground/5 group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-8 left-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">System Online</span>
              </div>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="space-y-8">
            <h2 className="text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">
              Technical Specifications
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { label: "Processor", value: "Apple M3 Max (16-core)" },
                { label: "Memory", value: "32GB Unified Memory" },
                { label: "Storage", value: "1TB SSD Storage" },
                { label: "Display", value: "14.2\" Liquid Retina XDR" },
                { label: "Battery", value: "98% Health (12 Cycles)" },
                { label: "Warranty", value: "AppleCare+ (Oct 2026)" },
              ].map((spec) => (
                <div key={spec.label} className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">{spec.label}</p>
                  <p className="text-sm font-bold text-foreground">{spec.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tags Management UI/UX */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-4">
              <h2 className="text-2xl font-brand font-black uppercase tracking-tight text-foreground">
                Asset Tags
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">{tags.length} Active Tags</span>
            </div>
            
            <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-[2rem] p-8 space-y-8">
              <div className="flex flex-wrap gap-3">
                <AnimatePresence mode="popLayout">
                  {tags.map((tag) => (
                    <motion.span 
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-foreground/[0.05] text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:border-rentr-primary/40 hover:text-rentr-primary transition-all group shadow-sm"
                    >
                      <TagIcon className="w-3 h-3 text-rentr-primary/40" />
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 p-0.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <form onSubmit={addTag} className="flex gap-4">
                <div className="relative flex-1 group">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="ADD NEW TAG..." 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-background border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                  />
                </div>
                <button 
                  type="submit"
                  className="px-8 rounded-2xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all shadow-lg"
                >
                  Add
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Right Column: Status & Timeline */}
        <div className="space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/[0.05] space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">Current Status</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-brand font-black text-emerald-500 uppercase">Available</h3>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest">Ready for deployment</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-background border border-foreground/[0.05]">
                <Clock className="w-4 h-4 text-rentr-primary mb-2" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Last Check</p>
                <p className="text-xs font-bold text-foreground">2h ago</p>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-foreground/[0.05]">
                <Shield className="w-4 h-4 text-rentr-primary mb-2" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Security</p>
                <p className="text-xs font-bold text-foreground">Locked</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground flex items-center gap-3">
              <History className="w-5 h-5 text-rentr-primary" />
              Asset History
            </h2>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-foreground/[0.05]">
              {[
                { event: "Maintenance Check", date: "Oct 12, 2025", user: "Admin", status: "Completed" },
                { event: "Rental Returned", date: "Oct 05, 2025", user: "Sarah Chen", status: "Success" },
                { event: "Rental Started", date: "Sep 05, 2025", user: "Sarah Chen", status: "Active" },
                { event: "Asset Registered", date: "Aug 20, 2025", user: "System", status: "Initial" },
              ].map((log, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border border-foreground/[0.05] flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-rentr-primary" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 mb-1">{log.date}</p>
                  <h4 className="text-sm font-bold text-foreground">{log.event}</h4>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-1">By {log.user} • {log.status}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-rentr-primary transition-colors border-t border-foreground/[0.05]">
              View Full Audit Trail
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
