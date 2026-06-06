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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    >
      <div className="absolute inset-0 bg-[#07070a]/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-[#0d0d14] rounded-2xl overflow-hidden border border-[#1e1e2e]/80 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e1e2e]/60">
            <svg className="w-4 h-4 text-[#6b6b7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Explorer la mémoire..."
              className="flex-1 bg-transparent text-sm text-[#e8e8f0] outline-none placeholder-[#6b6b7a] tracking-[0.01em]"
            />
            <kbd className="text-[10px] text-[#6b6b7a] px-1.5 py-0.5 rounded-md border border-[#1e1e2e] font-mono">
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
                    className="w-full text-left p-3.5 rounded-xl hover:bg-[#181825] transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getTypeColor(entry.metadata.type || 'note') }}
                      />
                      <span className="text-[9px] font-semibold text-[#7a7a8a] uppercase tracking-[0.08em]">
                        {entry.metadata.type || 'note'}
                      </span>
                      {entry.metadata.project && (
                        <span className="text-[9px] text-[#6b6b7a] px-2 py-0.5 rounded-md bg-[#1e1e2e]">
                          {entry.metadata.project}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#c0c0d0] leading-relaxed line-clamp-2">
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
                className="px-6 py-12 text-center"
              >
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-[#1e1e2e] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#6b6b7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#6b6b7a]">
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
                <p className="text-xs text-[#4a4a5a]">
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
