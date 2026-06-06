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

  // ── Loading State ──
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#07070a]">
        <div className="flex flex-col items-center gap-6">
          {/* Pulsing star */}
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-[#f5a623] animate-glow-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#f5a623]/30 blur-sm animate-ping" />
          </div>
          <p className="text-sm text-[#6b6b7a] tracking-[0.02em]">
            Connexion à la mémoire...
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || entries.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#07070a]">
        <div className="max-w-md text-center space-y-5 px-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#f87171]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#f87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#e8e8f0]">
            Mémoire inaccessible
          </h2>
          <p className="text-sm text-[#7a7a8a] leading-relaxed">
            {error || 'Aucune donnée mémoire disponible. Le cosmos est silencieux.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#f5a623] text-[#07070a] text-sm font-medium hover:bg-[#e0960f] transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 bg-[#07070a]">
      {/* ── 3D Scene ── */}
      <NeuronScene
        entries={entries}
        selectedId={selectedId}
        onSelect={handleSelect}
        onHover={setHoveredId}
      />

      {/* ── Search Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-center pointer-events-none pt-[10vh]">
        <button
          onClick={() => setSearchOpen(true)}
          className="group pointer-events-auto rounded-2xl px-6 py-3.5 flex items-center gap-3
            min-w-[400px] bg-[#0d0d14]
            border border-[#1e1e2e]/60
            shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
            text-sm text-[#6b6b7a] hover:text-[#e8e8f0]
            transition-all duration-300 ease-out
            hover:border-[#f5a623]/20
            hover:shadow-[0_8px_40px_-12px_rgba(245,166,35,0.15)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623]/30"
        >
          <svg className="w-4 h-4 text-[#4a4a5a] group-hover:text-[#f5a623] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="tracking-[0.02em] font-medium">Explorer la mémoire</span>
          <span className="flex-1" />
          <kbd className="text-[10px] text-[#4a4a5a] tracking-[0.04em]
            px-1.5 py-0.5 rounded-md border border-[#1e1e2e] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Hover Tooltip ── */}
      <AnimatePresence>
        {hoveredEntry && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-[#0d0d14] border border-[#1e1e2e]/60 rounded-2xl px-5 py-3 max-w-sm shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hoveredEntry ? getTypeColor(hoveredEntry.metadata.type || 'note') : '#71717A' }}
                />
                <span className="text-[9px] text-[#7a7a8a] font-semibold uppercase tracking-[0.08em]">
                  {hoveredEntry?.metadata.type || 'note'}
                </span>
                {hoveredEntry?.metadata.project && (
                  <span className="text-[9px] text-[#6b6b7a] px-2 py-0.5 rounded-md bg-[#181825]">
                    {hoveredEntry.metadata.project}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#c0c0d0] leading-relaxed line-clamp-1">
                {(hoveredEntry?.text || '').slice(0, 120)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* ── Count Badge ── */}
      <div className="fixed bottom-8 right-8 z-20">
        <div className="bg-[#0d0d14]/80 border border-[#1e1e2e]/60 rounded-full px-4 py-2
          text-[10px] text-[#4a4a5a] font-mono tracking-[0.04em]
          backdrop-blur-sm"
        >
          {entries.length} <span className="text-[#6b6b7a]">entrées</span>
        </div>
      </div>

      {/* ── Ambient Gradient ── */}
      <div
        className="fixed top-[-50vh] left-[-50vw] w-[200vw] h-[200vw] pointer-events-none z-0 opacity-[0.03]"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #6366f1 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #f5a623 0%, transparent 50%)',
        }}
      />
    </main>
  );
}

// Helper — avoid circular import
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
