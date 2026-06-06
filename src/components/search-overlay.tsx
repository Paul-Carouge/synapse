'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { springSnappy, easeOut, staggerContainer, staggerItem, buttonTap } from '@/lib/motion';
import type { MemoryEntry } from '@/lib/memory-data';

const typeIcons: Record<string, string> = {
  design: '⚙️',
  preference: '💡',
  architecture: '🏛️',
  learning: '📚',
  system: '⚙️',
  note: '📝',
  bug: '🐛',
  decision: '⚖️',
};

export default function SearchOverlay({
  entries,
  onSelect,
  onClose,
}: {
  entries: MemoryEntry[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEscape(onClose);
  useBodyScrollLock(true);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = query.trim()
    ? entries.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.text.toLowerCase().includes(q) ||
          (e.metadata.type || '').toLowerCase().includes(q) ||
          (e.metadata.project || '').toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div
        initial={{ y: -16, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -16, opacity: 0, scale: 0.96 }}
        transition={springSnappy}
        className="relative z-10 w-full max-w-lg max-sm:max-w-full max-sm:h-full max-sm:flex max-sm:flex-col"
        style={{
          padding: '0 clamp(0px, 5vw, 16px)',
          paddingTop: 'max(5vh, 24px)',
        }}
      >
        <div className="bg-[#0f1011] sm:rounded-2xl overflow-hidden border border-[#23252a]/80
          shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]
          max-sm:rounded-t-2xl max-sm:border-b max-sm:border-x max-sm:h-full max-sm:flex max-sm:flex-col">
          <div className="flex items-center gap-2 border-b border-[#23252a]/60"
            style={{ padding: '14px 16px' }}>
            {/* Bouton Fermer — visible mobile (bouton X), desktop (kbd) */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center shrink-0 lg:hidden"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#1a1a1e',
                border: '1px solid #27272a',
                color: '#8a8f98',
              }}
              aria-label="Fermer la recherche"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>

            {/* Icône recherche */}
            <svg className="w-4 h-4 text-[#f59e0b]/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Explorer la mémoire..."
                className="w-full bg-[#161718] text-sm text-[#f7f8f8] outline-none placeholder-[#62666d]
                  tracking-[0.01em] font-medium
                  rounded-lg border border-[#23252a]/50
                  focus:border-[#f59e0b]/30 focus:bg-[#1a1a1e]
                  transition-all duration-200"
                style={{ padding: '10px 12px' }}
              />
            </div>
            <motion.kbd
              whileHover={{ scale: 1.05 }}
              style={{ padding: '2px 8px' }}
              className="text-[11px] text-[#62666d] rounded-md border border-[#23252a] font-mono"
            >
              esc
            </motion.kbd>
          </div>

          <AnimatePresence mode="wait">
            {results.length > 0 && (
              <motion.div
                key="results"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-h-72 sm:max-h-72 overflow-y-auto max-sm:flex-1"
                style={{ padding: '8px' }}
              >
                {results.map((entry, i) => (
                  <motion.button
                    key={entry.id}
                    variants={staggerItem}
                    custom={i}
                    onClick={() => { onSelect(entry.id); onClose(); }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(22,23,24,1)' }}
                    whileTap={buttonTap}
                    style={{ padding: '14px' }}
                    className="w-full text-left rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs">{typeIcons[entry.metadata.type || 'note'] || '📄'}</span>
                      <span className="text-[10px] font-medium text-[#8a8f98] uppercase tracking-[0.06em]">
                        {entry.metadata.type || 'note'}
                      </span>
                      {entry.metadata.project && (
                        <span style={{ padding: '2px 8px' }} className="text-[10px] text-[#62666d] rounded-md bg-[#23252a]">
                          {entry.metadata.project}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#a1a1aa] leading-relaxed line-clamp-2">
                      {entry.text}
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {query.length > 0 && results.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={easeOut}
                className="text-center"
                style={{ padding: '40px 24px' }}
              >
                <p className="text-sm text-[#62666d]">
                  Aucun résultat pour &laquo;&nbsp;{query}&nbsp;&raquo;
                </p>
              </motion.div>
            )}

            {query.length === 0 && (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-center"
                style={{ padding: '32px 24px' }}
              >
                <p className="text-xs text-[#52525b]">
                  Tapez pour rechercher dans {entries.length} entrées mémoire
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
