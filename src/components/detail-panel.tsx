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
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
      />

      {/* Desktop: slide from right */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="hidden lg:block fixed right-0 top-0 bottom-0 z-40 w-full max-w-sm
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

      {/* Mobile: bottom sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0f1011] border-t border-[#23252a]/60
          rounded-t-2xl max-h-[85vh] overflow-y-auto
          pb-[env(safe-area-inset-bottom,16px)]"
      >
        <div className="sticky top-0 bg-[#0f1011] pt-3 pb-2 px-5 flex items-center justify-between border-b border-[#23252a]/40">
          <span className="text-[10px] text-[#62666d] font-medium uppercase tracking-[0.06em]">Détail</span>
          <button onClick={onClose} className="text-[10px] text-[#8a8f98] px-2 py-1 rounded-md border border-[#23252a] hover:text-[#f7f8f8] transition-colors">
            Fermer
          </button>
        </div>
        <div className="p-5">
          <MemoryCard entry={entry} />
        </div>
      </motion.div>
    </>
  );
}
