import React, { useState } from 'react';
import { ShieldCheck, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface PrivacyBadgeProps {
  interactionCount: number;
  onClearHistory: () => void;
  inline?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  interactionCount,
  onClearHistory,
  inline = false
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={inline ? 'relative z-40' : 'fixed top-4 right-4 z-40 sm:top-5 sm:right-6'}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Local-Only Taste Profile"
        className="min-h-[44px] inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1220]/75 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-xl transition-colors hover:border-[#D4AF37]/40 hover:text-slate-100 cursor-pointer"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
        <span className="tracking-wide">Local-Only Taste Profile</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={`${inline ? 'absolute right-0 ' : ''}mt-2 w-64 rounded-2xl border border-white/12 bg-[#0d1424]/95 p-4 text-left shadow-2xl backdrop-blur-2xl`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
              <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                Device Vault
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close privacy panel"
                className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>Stored locally</span>
              <span className="font-mono-tabular text-[#D4AF37]">{interactionCount} films</span>
            </div>
            {interactionCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setOpen(false);
                }}
                className="mt-3 w-full min-h-[40px] flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-300 hover:border-rose-400/40 hover:text-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear local history</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
