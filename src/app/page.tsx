'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuronScene from '@/components/neuron-scene';
import SearchOverlay from '@/components/search-overlay';
import DetailPanel from '@/components/detail-panel';
import TypeFilter from '@/components/type-filter';
import StatsBadge from '@/components/stats-badge';
import SceneControls from '@/components/scene-controls';
import BottomSheetNav from '@/components/bottom-sheet-nav';
import TimelineSlider from '@/components/timeline-slider';
import { loadMemoryData, getTypeColor, getUniqueTypes } from '@/lib/memory-data';
import { computeGraphLayout, findConnectedNodes } from '@/lib/graph-layout';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { MemoryEntry } from '@/lib/memory-data';
import { spring, easeOut, buttonTap } from '@/lib/motion';

export default function Home() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);

  // New state
  const [showEdges, setShowEdges] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [timelineRange, setTimelineRange] = useState<{ start: number; end: number } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // Auto-dismiss welcome
  useEffect(() => {
    if (!loading && entries.length > 0) {
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [loading, entries]);

  // ⌘K listener + other shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (selectedId) setSelectedId(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        setAutoRotate((prev) => !prev);
      }
      if (e.key === '?' && !searchOpen) {
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, searchOpen]);

  // Filter entries by timeline
  const filteredEntries = useMemo(() => {
    if (!timelineRange) return entries;
    return entries.filter((e) => {
      const ts = e.metadata.timestamp;
      if (!ts) return true;
      const t = new Date(ts).getTime();
      return t >= timelineRange.start && t <= timelineRange.end;
    });
  }, [entries, timelineRange]);

  // Compute graph for filtered entries
  const graph = useMemo(() => {
    if (filteredEntries.length === 0) return { nodes: [], edges: [] };
    return computeGraphLayout(filteredEntries);
  }, [filteredEntries]);

  const selectedEntry = useMemo(
    () => filteredEntries.find((e) => e.id === selectedId) || null,
    [filteredEntries, selectedId],
  );

  const hoveredEntry = useMemo(
    () => filteredEntries.find((e) => e.id === hoveredId) || null,
    [filteredEntries, hoveredId],
  );

  // Connected entries for the selected node
  const connectedEntries = useMemo(() => {
    if (!selectedId || graph.edges.length === 0) return [];
    const connectedIds = findConnectedNodes(selectedId, graph.edges);
    return filteredEntries
      .filter((e) => connectedIds.has(e.id))
      .slice(0, 12);
  }, [selectedId, graph.edges, filteredEntries]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    setActiveTab(null);
  }, []);

  const handleTabChange = useCallback((tab: string | null) => {
    setActiveTab(tab);
    if (tab === 'search') setSearchOpen(true);
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // ── Loading State ──
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={easeOut}
        className="fixed inset-0 flex items-center justify-center bg-[#070708]"
        style={{ padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-[#f59e0b]"
            style={{ boxShadow: '0 0 20px rgba(245,158,11,0.6)' }}
          />
          <p className="text-sm text-[#62666d]">Établir connexion synaptique...</p>
        </motion.div>
      </motion.div>
    );
  }

  // ── Error / Empty State ──
  if (error || entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={easeOut}
        className="fixed inset-0 flex items-center justify-center bg-[#070708]"
        style={{ padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          style={{ padding: '0 24px' }}
          className="max-w-md text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
            className="w-10 h-10 mx-auto rounded-full bg-[#EF4444]/10 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </motion.div>
          <h2 className="text-base font-semibold text-[#f7f8f8]">Mémoire inaccessible</h2>
          <p className="text-sm text-[#8a8f98] leading-relaxed">
            {error || 'Aucune donnée mémoire disponible.'}
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(245,158,11,0.35)' }}
            whileTap={buttonTap}
            transition={spring}
            style={{ padding: '10px 20px' }}
            className="rounded-lg bg-[#f59e0b] text-[#070708] text-sm font-medium"
          >
            Réessayer
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 bg-[#070708] overflow-hidden"
      style={{ padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' }}
    >
      {/* ── 3D Scene ── */}
      <NeuronScene
        entries={filteredEntries}
        selectedId={selectedId}
        activeType={activeType}
        showEdges={showEdges}
        autoRotate={autoRotate}
        onSelect={handleSelect}
        onHover={setHoveredId}
      />

      {/* ── Welcome Message ── */}
      <AnimatePresence>
        {showWelcome && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 z-5 flex items-center justify-center pointer-events-none"
          >
            <div style={{ padding: '0 24px' }} className="text-center">
              <p className="text-sm text-[#62666d]">Votre espace mémoire vous attend</p>
              <div className="mt-4 mx-auto w-16 h-[1px] bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TypeFilter pills — Desktop ── */}
      <div className="hidden lg:block" style={{ position: 'fixed', top: '80px', left: '24px', zIndex: 10, maxWidth: 'calc(100vw - 300px)' }}>
        <TypeFilter entries={filteredEntries} activeType={activeType} onTypeChange={setActiveType} />
      </div>

      {/* ── Search Bar — Desktop ── */}
      <div className="hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <motion.button
          onClick={() => setSearchOpen(true)}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.2 }}
          whileHover={{
            scale: 1.02,
            borderColor: 'rgba(245,158,11,0.4)',
            boxShadow: '0 0 24px rgba(245,158,11,0.12)',
          }}
          whileTap={buttonTap}
          style={{ padding: '11px 18px' }}
          className="pointer-events-auto rounded-xl flex items-center gap-3
            min-w-[360px] bg-[#0f1011] border border-[#23252a]/80
            shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]
            text-sm text-[#8a8f98]"
        >
          <svg className="w-4 h-4 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Explorer la mémoire</span>
          <span className="flex-1" />
          <kbd style={{ padding: '2px 8px' }} className="text-[11px] text-[#62666d] rounded-md border border-[#23252a] font-mono">⌘K</kbd>
        </motion.button>
      </div>

      {/* ── Search FAB — Mobile ── */}
      <motion.button
        onClick={() => setSearchOpen(true)}
        initial={{ opacity: 0, scale: 0.5, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
        whileTap={buttonTap}
        className="lg:hidden fixed top-[max(env(safe-area-inset-top,4px),16px)] right-4 z-15 w-10 h-10 rounded-xl
          bg-[#0f1011] border border-[#23252a]/80
          flex items-center justify-center
          shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]
          tap-highlight-transparent"
        aria-label="Rechercher"
      >
        <svg className="w-4 h-4 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </motion.button>

      {/* ── Legend Button ── */}
      <motion.button
        onClick={() => setLegendOpen((prev) => !prev)}
        initial={{ opacity: 0, scale: 0.5, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...spring, delay: 0.35 }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}
        whileTap={buttonTap}
        className="fixed top-[max(env(safe-area-inset-top,4px),16px)] left-4 z-15 w-10 h-10 rounded-xl
          bg-[#0f1011] border border-[#23252a]/80
          flex items-center justify-center
          shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]
          tap-highlight-transparent"
        aria-label="Légende des couleurs"
      >
        <svg className="w-4 h-4 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </motion.button>

      {/* ── Legend Popover ── */}
      <AnimatePresence>
        {legendOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed z-20"
            style={{
              top: 'calc(max(env(safe-area-inset-top,4px),16px) + 48px)',
              left: '16px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#0f1011',
              border: '1px solid rgba(35,37,42,0.6)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              minWidth: '160px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getUniqueTypes(filteredEntries).map((t) => {
                const icons: Record<string, string> = {
                  design: '⚙️', preference: '💡', architecture: '🏛️',
                  learning: '📚', system: '⚙️', note: '📝', bug: '🐛', decision: '⚖️',
                };
                return (
                  <div key={t.id} className="flex items-center gap-2.5">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getTypeColor(t.id), flexShrink: 0 }} />
                    <span style={{ fontSize: '12px' }}>{icons[t.id] ?? '📄'}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#8a8f98', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TypeFilter Drawer — Mobile ── */}
      <AnimatePresence>
        {activeTab === 'filters' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0f1011] border-t border-[#23252a]/60
              rounded-t-2xl max-h-[70vh] overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="sticky top-0 bg-[#0f1011] pt-3 pb-3 flex items-center justify-between border-b border-[#23252a]/40"
              style={{ paddingInline: '20px' }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#62666d' }}>Filtres</span>
              <button
                onClick={() => setActiveTab(null)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: '#1a1a1e', border: '1px solid #27272a',
                  color: '#8a8f98', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Fermer les filtres"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <TypeFilter entries={filteredEntries} activeType={activeType} onTypeChange={(t) => { setActiveType(t); setActiveTab(null); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Drawer — Mobile ── */}
      <AnimatePresence>
        {activeTab === 'stats' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={spring}
            className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0f1011] border-t border-[#23252a]/60
              rounded-t-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="sticky top-0 bg-[#0f1011] pt-3 pb-3 flex items-center justify-between border-b border-[#23252a]/40"
              style={{ paddingInline: '20px' }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#62666d' }}>Statistiques</span>
              <button
                onClick={() => setActiveTab(null)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: '#1a1a1e', border: '1px solid #27272a',
                  color: '#8a8f98', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Fermer les statistiques"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <StatsBadge entries={filteredEntries} lastUpdated={filteredEntries[0]?.metadata.timestamp} big />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hover Tooltip ── */}
      <AnimatePresence>
        {hoveredEntry && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={easeOut}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none
              max-sm:top-auto max-sm:bottom-28"
          >
            <div style={{ padding: '10px 16px' }} className="bg-[#0f1011] border border-[#23252a]/60 rounded-xl max-w-xs shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getTypeColor(hoveredEntry.metadata.type || 'note') }} />
                <span className="text-[10px] text-[#8a8f98] font-medium uppercase tracking-[0.06em]">
                  {hoveredEntry.metadata.type || 'note'}
                </span>
                {hoveredEntry.metadata.project && (
                  <span style={{ padding: '1px 6px' }} className="text-[9px] text-[#62666d] rounded bg-[#23252a]">
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

      {/* ── Timeline ── */}
      <TimelineSlider
        entries={filteredEntries}
        active={timelineRange !== null}
        onRangeChange={setTimelineRange}
      />

      {/* ── Scene Controls — Desktop ── */}
      <SceneControls
        showEdges={showEdges}
        autoRotate={autoRotate}
        onToggleEdges={() => setShowEdges((p) => !p)}
        onToggleAutoRotate={() => setAutoRotate((p) => !p)}
        onResetCamera={handleResetCamera}
        onTimelineChange={setTimelineRange}
        hasTimelineFilter={timelineRange !== null}
      />

      {/* ── StatsBadge — Desktop ── */}
      <div className="hidden lg:block">
        <StatsBadge entries={filteredEntries} lastUpdated={filteredEntries[0]?.metadata.timestamp} />
      </div>

      {/* ── Shortcuts hint — Desktop ── */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-10">
        <motion.button
          onClick={() => setShowShortcuts((p) => !p)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(15,16,17,0.7)',
            border: '1px solid rgba(35,37,42,0.5)',
            color: '#52525b',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          <kbd className="font-mono">?</kbd> Raccourcis
        </motion.button>
      </div>

      {/* ── Shortcuts Modal ── */}
      <AnimatePresence>
        {showShortcuts && (
          <ShortcutsModal onClose={() => setShowShortcuts(false)} />
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet Navigation — Mobile ── */}
      <BottomSheetNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            entries={filteredEntries}
            onSelect={(id) => { setSelectedId(id); setSearchOpen(false); }}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Detail Panel ── */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailPanel
            entry={selectedEntry}
            connectedEntries={connectedEntries}
            onClose={() => setSelectedId(null)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1023px) {
          .desktop-filter-bar { display: none !important; }
        }
      `}</style>
    </motion.main>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEscape(onClose);
  useBodyScrollLock(true);

  const shortcuts = [
    { key: '⌘K', action: 'Ouvrir la recherche' },
    { key: '⌘R', action: 'Activer/désactiver rotation' },
    { key: 'Escape', action: 'Fermer le détail / désélectionner' },
    { key: '?', action: 'Afficher ces raccourcis' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={spring}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto"
          style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: '#0f1011',
            border: '1px solid rgba(35,37,42,0.6)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            minWidth: '280px',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#62666d' }}>
              Raccourcis clavier
            </span>
            <button
              onClick={onClose}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                backgroundColor: '#1a1a1e', border: '1px solid #27272a',
                color: '#8a8f98', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-xs text-[#a1a1aa]">{s.action}</span>
                <kbd style={{ padding: '2px 8px' }} className="text-[10px] text-[#f7f8f8] rounded-md bg-[#23252a] font-mono ml-4">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
