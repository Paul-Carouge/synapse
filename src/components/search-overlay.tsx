'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { MemoryEntry } from '@/lib/memory-data';

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
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-[#0f1011] rounded-2xl overflow-hidden border border-[#23252a]/80 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#23252a]/60">
            <svg className="w-4 h-4 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Explorer la mémoire..."
              className="flex-1 bg-transparent text-sm text-[#f7f8f8] outline-none placeholder-[#62666d]"
            />
            <kbd className="text-[11px] text-[#62666d] px-2 py-0.5 rounded-md border border-[#23252a] font-mono">
              esc
            </kbd>
          </div>

          <AnimatePresence mode="wait">
            {results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-h-72 overflow-y-auto p-2 space-y-0.5"
              >
                {results.map((entry, i) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.2 }}
                    onClick={() => { onSelect(entry.id); onClose(); }}
                    className="w-full text-left p-3.5 rounded-xl hover:bg-[#161718] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getTypeColor(entry.metadata.type || 'note') }}
                      />
                      <span className="text-[10px] font-medium text-[#8a8f98] uppercase tracking-[0.06em]">
                        {entry.metadata.type || 'note'}
                      </span>
                      {entry.metadata.project && (
                        <span className="text-[10px] text-[#62666d] px-2 py-0.5 rounded-md bg-[#23252a]">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-10 text-center"
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
                className="px-6 py-8 text-center"
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
