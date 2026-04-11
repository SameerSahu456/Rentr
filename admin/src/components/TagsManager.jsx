import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';

export default function TagsManager({ tags = [], onTagsChange, readOnly = false }) {
  const [newTag, setNewTag] = useState('');

  const addTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange?.([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    onTagsChange?.(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {tags.length === 0 && (
            <p className="text-[10px] text-foreground/20 font-serif italic py-2">No tags assigned</p>
          )}
          {tags.map((tag) => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-foreground/[0.06] text-[9px] font-bold uppercase tracking-widest text-foreground/50 hover:border-rentr-primary/30 hover:text-rentr-primary transition-all group"
            >
              <TagIcon className="w-3 h-3 text-rentr-primary/40" />
              {tag}
              {!readOnly && (
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {!readOnly && (
        <form onSubmit={addTag} className="flex gap-3">
          <div className="relative flex-1 group">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="ADD TAG..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full bg-background border border-foreground/[0.06] rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold tracking-[0.15em] focus:outline-none focus:border-rentr-primary/30 transition-all placeholder:text-foreground/10"
            />
          </div>
          <button
            type="submit"
            className="px-5 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
