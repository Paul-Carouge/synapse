'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuronScene from '@/components/neuron-scene';
import SearchOverlay from '@/components/search-overlay';
import DetailPanel from '@/components/detail-panel';
import TypeFilter from '@/components/type-filter';
import LegendBar from '@/components/legend-bar';
import StatsBadge from '@/components/stats-badge';
import { loadMemoryData, getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

export default function Home() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Load data
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

  // Auto-dismiss welcome after 5s
  useEffect(() => {
    if (!loading && entries.length > 0) {
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, entries]);

  // ⌘K listener
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

  // ── Loading State ──
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#070708]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-glow-pulse" />
          <p className="text-sm text-[#62666d] tracking-[0.02em]">
            Connexion à la mémoire...
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-[1px] bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent"
          />
        </div>
      </div>
    );
  }

  // ── Error / Empty State ──
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
      {/* ── 3D Scene ── */}
      <NeuronScene
        entries={entries}
        selectedId={selectedId}
        activeType={activeType}
        onSelect={handleSelect}
        onHover={setHoveredId}
      />

      {/* ── Welcome Message (auto-dismiss) ── */}
      <AnimatePresence>
        {showWelcome && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 z-5 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <p className="text-sm text-[#62666d] tracking-[0.02em]">
                Votre espace mémoire vous attend
              </p>
              <motion.div
                className="mt-4 mx-auto w-16 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Type Filter (top-left) ── */}
      <TypeFilter
        entries={entries}
        activeType={activeType}
        onTypeChange={setActiveType}
      />

      {/* ── Search Bar (top-center) ── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <button
          onClick={() => setSearchOpen(true)}
          className="pointer-events-auto rounded-xl px-5 py-3 flex items-center gap-3
            min-w-[360px] bg-[#0f1011]
            border border-[#23252a]/80
            shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
            text-sm text-[#8a8f98] hover:text-[#f7f8f8]
            hover:border-[#f59e0b]/20
            hover:shadow-[0_8px_40px_-12px_rgba(245,158,11,0.15)]
            transition-all duration-300 ease-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/30"
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

      {/* ── Stats Badge (top-right) ── */}
      <StatsBadge entries={entries} lastUpdated={entries[0]?.metadata.timestamp} />

      {/* ── Hover Tooltip (bottom-center) ── */}
      <AnimatePresence>
        {hoveredEntry && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
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
                {hoveredEntry.text.slice(0, 120)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend Bar (bottom-left) ── */}
      <LegendBar entries={entries} />

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            entries={entries}
            onSelect={(id) => setSelectedId(id)}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Detail Panel ── */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailPanel
            entry={selectedEntry}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Ambient gradient overlay ── */}
      <div
        className="fixed top-[-50vh] left-[-50vw] w-[200vw] h-[200vw] pointer-events-none z-0 opacity-[0.02]"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #f59e0b 0%, transparent 60%)',
        }}
      />
    </main>
  );
}
