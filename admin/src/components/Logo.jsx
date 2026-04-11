import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

export function Logo({ className, size = 'md', showTagline = false }) {
  return (
    <div className={cn('flex flex-col font-brand font-black uppercase tracking-[-0.05em] leading-none select-none cursor-default group', className)}>
      <div className={cn('flex items-baseline overflow-hidden', sizeClasses[size])}>
        <motion.span
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-foreground"
        >
          RENT
        </motion.span>
        <motion.span
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="text-rentr-primary"
        >
          R
        </motion.span>
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex gap-1 mt-[0.1em] w-full origin-left"
      >
        <div className="h-[1px] flex-1 bg-rentr-primary/60" />
        <div className="h-[1px] w-[1px] rounded-full bg-foreground/20" />
        <div className="h-[1px] w-[1px] rounded-full bg-foreground/20" />
        <div className="h-[1px] w-[1px] rounded-full bg-foreground/20" />
      </motion.div>
      {showTagline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-3 text-[9px] tracking-[0.6em] text-foreground/30 font-medium font-sans"
        >
          TECH RENTALS SIMPLIFIED
        </motion.div>
      )}
    </div>
  );
}

export function RentrIcon({ className, size = 'md' }) {
  const iconSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn('flex flex-col items-end select-none cursor-default group', className)}>
      <span className={cn('font-brand font-black text-rentr-primary transition-transform duration-500 group-hover:scale-110', iconSizes[size])}>R</span>
      <div className="h-[1px] w-full bg-rentr-primary/60 mt-0.5" />
    </div>
  );
}
