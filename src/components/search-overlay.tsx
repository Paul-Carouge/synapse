'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTypeColor, getUniqueTypes, getUniqueProjects } from '@/lib/memory-data';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { springSnappy, easeOut, staggerContainer, staggerItem, buttonTap } from '@/lib/motion';
import type { MemoryEntry } from '@/lib/memory-data';

const colors = {
  surface: '#0f1011',
  raised: '#161718',
  border: '#1e1f22',
  borderLight: '#2a2b2e',
  textPrimary: '#ededef',
  textSecondary: '#8a8f98',
  textTertiary: '#52525b',
  accent: '#f59e0b',
  accentSubtle: 'rgba(245,158,11,0.12)',
};

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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '8vh',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
      />

      <motion.div
        initial={{ y: -16, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -16, opacity: 0, scale: 0.96 }}
        transition={springSnappy}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '512px',
          padding: '0 clamp(0px, 5vw, 16px)',
          paddingTop: 'max(3vh, 16px)',
        }}
      >
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px -12px rgba(0,0,0,0.6)',
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Fermer la recherche"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: colors.raised,
                border: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>

            <svg
              style={{ width: '16px', height: '16px', color: `${colors.accent}99`, flexShrink: 0 }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Explorer la mémoire..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: colors.raised,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: '8px',
                  color: colors.textPrimary,
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = `${colors.accent}4D`;
                  e.target.style.backgroundColor = '#1a1a1e';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.borderLight;
                  e.target.style.backgroundColor = colors.raised;
                }}
              />
            </div>

            <motion.kbd
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                color: colors.textTertiary,
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                fontFamily: 'monospace',
                display: 'none',
              }}
            >
              esc
            </motion.kbd>
          </div>

          {/* Filter chips row */}
          {(types.length > 0 || projects.length > 0) && (
            <div
              style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                        border: isActive ? `1px solid ${c}55` : `1px solid ${colors.borderLight}`,
                        backgroundColor: isActive ? `${c}12` : 'transparent',
                        color: isActive ? c : colors.textTertiary,
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
                        border: isActive ? `1px solid ${colors.accent}55` : `1px solid ${colors.borderLight}`,
                        backgroundColor: isActive ? colors.accentSubtle : 'transparent',
                        color: isActive ? colors.accent : colors.textTertiary,
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
                      color: colors.textSecondary,
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
                style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  padding: '8px',
                }}
              >
                {results.map((entry, i) => (
                  <motion.button
                    key={entry.id}
                    variants={staggerItem}
                    custom={i}
                    onClick={() => { onSelect(entry.id); }}
                    whileHover={{ scale: 1.01, backgroundColor: colors.raised }}
                    whileTap={buttonTap}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      border: 'none',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: getTypeColor(entry.metadata.type || 'note'),
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          color: colors.textSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {typeEmojis[entry.metadata.type || 'note'] || '📄'} {entry.metadata.type || 'note'}
                      </span>
                      {entry.metadata.project && (
                        <span
                          style={{
                            padding: '1px 7px',
                            fontSize: '10px',
                            color: colors.textTertiary,
                            borderRadius: '6px',
                            backgroundColor: colors.border,
                          }}
                        >
                          {entry.metadata.project}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#a1a1aa',
                        lineHeight: 1.625,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
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
                style={{ textAlign: 'center', padding: '40px 24px' }}
              >
                <p style={{ fontSize: '13px', color: colors.textTertiary }}>
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
                style={{ textAlign: 'center', padding: '24px 24px' }}
              >
                <p style={{ fontSize: '12px', color: colors.textTertiary }}>
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
