'use client';

import { motion } from 'framer-motion';
import MemoryCard from '@/components/memory-card';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { MemoryEntry } from '@/lib/memory-data';

export default function DetailPanel({
  entry,
  onClose,
}: {
  entry: MemoryEntry;
  onClose: () => void;
}) {
  useEscape(onClose);
  useBodyScrollLock(true);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 bg-[#07070a]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 1 }}
        className="fixed right-4 top-4 bottom-4 z-40 w-full max-w-sm
          bg-[#0d0d14] rounded-2xl
          border border-[#1e1e2e]/80
          shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)]
          overflow-hidden
          flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-[#6b6b7a] hover:text-[#e8e8f0] transition-colors duration-200 py-1 px-2 -ml-2 rounded-lg hover:bg-[#181825]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <span className="text-[9px] text-[#4a4a5a] uppercase tracking-[0.08em] font-mono">
            détail
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <MemoryCard entry={entry} expanded />
        </div>
      </motion.div>
    </>
  );
}
