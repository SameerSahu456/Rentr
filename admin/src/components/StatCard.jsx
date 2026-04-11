import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative p-6 lg:p-8 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.01] group hover:bg-foreground/[0.025] hover:border-rentr-primary/15 transition-all duration-700 overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rentr-primary/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors duration-500">{title}</span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg border border-foreground/[0.04] flex items-center justify-center group-hover:border-rentr-primary/20 group-hover:bg-rentr-primary/5 transition-all duration-500">
              <Icon size={14} className="text-foreground/15 group-hover:text-rentr-primary transition-colors duration-500" />
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-3xl lg:text-4xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500 leading-none">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
