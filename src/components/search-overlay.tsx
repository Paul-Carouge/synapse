'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTypeColor, getUniqueTypes, getUniqueProjects } from '@/lib/memory-data';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { springSnappy, easeOut, staggerContainer, staggerItem, buttonTap } from '@/lib/motion';
import type { MemoryEntry } from '@/lib/memory-data';

const typeEmojis: Record<string, string> = {
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
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscape(onClose);
  useBodyScrollLock(true);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const types = useMemo(() => getUniqueTypes(entries), [entries]);
  const projects = useMemo(() => getUniqueProjects(entries), [entries]);

  const results = useMemo(() => {
    return entries.filter((e) => {
      // Type filter
      if (selectedType && (e.metadata.type || 'note') !== selectedType) return false;
      // Project filter
      if (selectedProject && e.metadata.project !== selectedProject) return false;
      // Text search
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          e.text.toLowerCase().includes(q) ||
          (e.metadata.type || '').toLowerCase().includes(q) ||
          (e.metadata.project || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, query, selectedType, selectedProject]);

  const hasFilters = selectedType !== null || selectedProject !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]"
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
          paddingTop: 'max(3vh, 16px)',
        }}
      >
        <div className="bg-[#0f1011] sm:rounded-2xl overflow-hidden border border-[#23252a]/80
          shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]
          max-sm:rounded-t-2xl max-sm:border-b max-sm:border-x max-sm:h-full max-sm:flex max-sm:flex-col">
          
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-[#23252a]/60"
            style={{ padding: '12px 16px' }}>
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
                style={{ padding: '9px 12px' }}
              />
            </div>
            <motion.kbd
              whileHover={{ scale: 1.05 }}
              style={{ padding: '2px 8px' }}
              className="text-[11px] text-[#62666d] rounded-md border border-[#23252a] font-mono hidden sm:block"
            >
              esc
            </motion.kbd>
          </div>

          {/* Filter chips row */}
          {(types.length > 0 || projects.length > 0) && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(35,37,42,0.4)' }}>
              <div className="flex flex-wrap gap-1.5">
                {/* Type filters */}
                {types.map((t) => {
                  const isActive = selectedType === t.id;
                  const c = getTypeColor(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(isActive ? null : t.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        border: isActive ? `1px solid ${c}55` : '1px solid rgba(35,37,42,0.5)',
                        backgroundColor: isActive ? `${c}12` : 'transparent',
                        color: isActive ? c : '#52525b',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                    >
                      {typeEmojis[t.id] || '📄'} {t.label}
                    </button>
                  );
                })}

                {/* Project filters */}
                {projects.map((p) => {
                  const isActive = selectedProject === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedProject(isActive ? null : p)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        border: isActive ? '1px solid #f59e0b55' : '1px solid rgba(35,37,42,0.5)',
                        backgroundColor: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                        color: isActive ? '#f59e0b' : '#52525b',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                    >
                      📁 {p}
                    </button>
                  );
                })}

                {hasFilters && (
                  <button
                    onClick={() => { setSelectedType(null); setSelectedProject(null); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#8a8f98',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                    }}
                  >
                    ✕ Effacer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {results.length > 0 && (
              <motion.div
                key="results"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="max-h-80 sm:max-h-80 overflow-y-auto max-sm:flex-1"
                style={{ padding: '8px' }}
              >
                {results.map((entry, i) => (
                  <motion.button
                    key={entry.id}
                    variants={staggerItem}
                    custom={i}
                    onClick={() => { onSelect(entry.id); }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(22,23,24,1)' }}
                    whileTap={buttonTap}
                    style={{ padding: '12px' }}
                    className="w-full text-left rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getTypeColor(entry.metadata.type || 'note') }} />
                      <span className="text-[10px] font-medium text-[#8a8f98] uppercase tracking-[0.06em]">
                        {typeEmojis[entry.metadata.type || 'note'] || '📄'} {entry.metadata.type || 'note'}
                      </span>
                      {entry.metadata.project && (
                        <span style={{ padding: '1px 7px' }} className="text-[10px] text-[#62666d] rounded-md bg-[#23252a]">
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

            {(query.length > 0 || hasFilters) && results.length === 0 && (
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
                  {hasFilters && ' avec ces filtres'}
                </p>
              </motion.div>
            )}

            {query.length === 0 && !hasFilters && (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-center"
                style={{ padding: '24px 24px' }}
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
