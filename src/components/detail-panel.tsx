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
        className="fixed inset-0 z-30 bg-black/40"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-sm
          bg-[#0f1011] border-l border-[#23252a]/80
          shadow-[-8px_0_32px_-12px_rgba(0,0,0,0.6)]
          overflow-y-auto"
      >
        <div className="p-5 space-y-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <MemoryCard entry={entry} />
        </div>
      </motion.div>
    </>
  );
}
