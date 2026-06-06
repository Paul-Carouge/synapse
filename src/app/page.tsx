'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuronScene from '@/components/neuron-scene';
import SearchOverlay from '@/components/search-overlay';
import DetailPanel from '@/components/detail-panel';
import { loadMemoryData } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

export default function Home() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMemoryData().then((data) => {
      if (cancelled) return;
      setEntries(data);
      setLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedId) || null,
    [entries, selectedId],
  );

  const hoveredEntry = useMemo(
    () => entries.find((e) => e.id === hoveredId) || null,
    [entries, hoveredId],
  );

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-glow-pulse" />
          <p className="text-sm text-[#62666d]">Connexion à la mémoire...</p>
        </div>
      </div>
    );
  }

  // Error / Empty State
  if (error || entries.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
        <div className="max-w-md text-center space-y-4 px-6">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#EF4444]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-[#f7f8f8]">
            Mémoire inaccessible
          </h2>
          <p className="text-sm text-[#8a8f98] leading-relaxed">
            {error || 'Aucune donnée mémoire disponible.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#070708] text-sm font-medium hover:bg-[#d97706] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 bg-[#070708]">
      <NeuronScene
        entries={entries}
        selectedId={selectedId}
        onSelect={handleSelect}
        onHover={setHoveredId}
      />

      {/* Search bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-center pt-8 pointer-events-none">
        <button
          onClick={() => setSearchOpen(true)}
          className="pointer-events-auto rounded-xl px-5 py-3 flex items-center gap-3
            min-w-[360px] bg-[#0f1011]
            border border-[#23252a]/80
            shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
            text-sm text-[#8a8f98] hover:text-[#f7f8f8]
            hover:border-[#f59e0b]/20
            transition-all duration-300 ease-out"
        >
          <svg className="w-4 h-4 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="tracking-[0.01em]">Explorer la mémoire</span>
          <span className="flex-1" />
          <kbd className="text-[11px] text-[#62666d] tracking-[0.04em]
            px-2 py-0.5 rounded-md border border-[#23252a] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredEntry && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-[#0f1011] border border-[#23252a]/60 rounded-xl px-4 py-2.5 max-w-sm shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getTypeColor(hoveredEntry.metadata.type || 'note') }}
                />
                <span className="text-[10px] text-[#8a8f98] font-medium uppercase tracking-[0.06em]">
                  {hoveredEntry.metadata.type || 'note'}
                </span>
                {hoveredEntry.metadata.project && (
                  <span className="text-[10px] text-[#62666d] px-2 py-0.5 rounded-md bg-[#23252a]">
                    {hoveredEntry.metadata.project}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-1">
                {hoveredEntry.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            entries={entries}
            onSelect={(id) => setSelectedId(id)}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailPanel
            entry={selectedEntry}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>

      {/* Count badge */}
      <div className="fixed bottom-6 right-6 z-20">
        <div className="bg-[#0f1011] border border-[#23252a]/60 rounded-full px-3.5 py-1.5
          text-[10px] text-[#62666d]">
          {entries.length} entrées
        </div>
      </div>
    </main>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    architecture: '#F59E0B',
    bug: '#EF4444',
    decision: '#3B82F6',
    learning: '#22C55E',
    preference: '#A855F7',
    system: '#06B6D4',
    note: '#71717A',
    design: '#f54e00',
  };
  return colors[type] ?? '#71717A';
}
