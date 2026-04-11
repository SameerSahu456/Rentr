import { useState } from 'react';
import { motion } from 'motion/react';

export default function DetailTabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  const activeTab = tabs.find((t) => t.key === active);

  return (
    <>
      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-foreground/[0.06] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active === tab.key
                ? 'text-rentr-primary'
                : 'text-foreground/40 hover:text-foreground/60'
            }`}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-foreground/[0.05] text-foreground/40">
                {tab.count}
              </span>
            )}
            {active === tab.key && (
              <motion.div
                layoutId="detail-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rentr-primary rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="space-y-6"
      >
        {activeTab?.content}
      </motion.div>
    </>
  );
}
