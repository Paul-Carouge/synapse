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
import { tokens, border, borderLight } from '@/lib/tokens';
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
  const [showEdges, setShowEdges] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [timelineRange, setTimelineRange] = useState<{ start: number; end: number } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

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
    if (!loading && entries.length > 0) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [loading, entries]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen((prev) => !prev); }
      if (e.key === 'Escape' && selectedId) setSelectedId(null);
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') { e.preventDefault(); setAutoRotate((prev) => !prev); }
      if (e.key === '?' && !searchOpen) setShowShortcuts((prev) => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, searchOpen]);

  const filteredEntries = useMemo(() => {
    if (!timelineRange) return entries;
    return entries.filter((e) => {
      const ts = e.metadata.timestamp;
      if (!ts) return true;
      const t = new Date(ts).getTime();
      return t >= timelineRange.start && t <= timelineRange.end;
    });
  }, [entries, timelineRange]);

  const graph = useMemo(() => {
    if (filteredEntries.length === 0) return { nodes: [], edges: [] };
    return computeGraphLayout(filteredEntries);
  }, [filteredEntries]);

  const selectedEntry = useMemo(() => filteredEntries.find((e) => e.id === selectedId) || null, [filteredEntries, selectedId]);
  const hoveredEntry = useMemo(() => filteredEntries.find((e) => e.id === hoveredId) || null, [filteredEntries, hoveredId]);

  const connectedEntries = useMemo(() => {
    if (!selectedId || graph.edges.length === 0) return [];
    const connectedIds = findConnectedNodes(selectedId, graph.edges);
    return filteredEntries.filter((e) => connectedIds.has(e.id)).slice(0, 12);
  }, [selectedId, graph.edges, filteredEntries]);

  const handleSelect = useCallback((id: string | null) => { setSelectedId(id); setActiveTab(null); }, []);
  const handleTabChange = useCallback((tab: string | null) => { setActiveTab(tab); if (tab === 'search') setSearchOpen(true); }, []);
  const handleResetCamera = useCallback(() => setSelectedId(null), []);
  const handleNavigate = useCallback((id: string) => setSelectedId(id), []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: tokens.deep }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="w-1.5 h-1.5 rounded-full" style={{ background: tokens.accent }} />
          <p className="text-xs" style={{ color: tokens.textTertiary }}>Chargement...</p>
        </motion.div>
      </div>
    );
  }

  // ── Error ──
  if (error || entries.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: tokens.deep }}>
        <div className="text-center max-w-xs" style={{ padding: '0 24px' }}>
          <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: '#EF444410' }}>
            <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: tokens.textSecondary, marginBottom: '16px' }}>{error || 'Aucune donnée mémoire disponible.'}</p>
          <button onClick={() => window.location.reload()} className="text-xs" style={{ color: tokens.accent, fontWeight: 500 }}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ background: tokens.deep }}>
      {/* 3D Scene */}
      <NeuronScene
        entries={filteredEntries}
        selectedId={selectedId}
        activeType={activeType}
        showEdges={showEdges}
        autoRotate={autoRotate}
        onSelect={handleSelect}
        onHover={setHoveredId}
      />

      {/* Welcome */}
      <AnimatePresence>
        {showWelcome && !selectedId && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-5 flex items-center justify-center pointer-events-none"
            style={{ color: tokens.textTertiary, fontSize: `${tokens.caption}px`, padding: '0 24px' }}
          >
            {filteredEntries.length} entrées mémoire
          </motion.p>
        )}
      </AnimatePresence>

      {/* TypeFilter — Desktop */}
      <div className="hidden lg:block" style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 10, maxWidth: 'calc(100vw - 340px)' }}>
        <TypeFilter entries={filteredEntries} activeType={activeType} onTypeChange={setActiveType} />
      </div>

      {/* Search bar — Desktop */}
      <div className="hidden lg:block fixed top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <motion.button
          onClick={() => setSearchOpen(true)}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          whileHover={{ borderColor: tokens.accent + '40' }}
          whileTap={buttonTap}
          style={{ padding: '8px 14px', border, background: tokens.surface, minWidth: '320px', borderRadius: `${tokens.radius.md}px` }}
          className="pointer-events-auto flex items-center gap-3 text-xs"
        >
          <svg className="w-3 h-3" style={{ color: tokens.textTertiary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span style={{ color: tokens.textTertiary }}>Rechercher</span>
          <span className="flex-1" />
          <kbd style={{ padding: '1px 5px', fontSize: '9px', borderRadius: '4px', border: `1px solid ${tokens.border}`, color: tokens.textTertiary }} className="font-mono">⌘K</kbd>
        </motion.button>
      </div>

      {/* Search FAB — Mobile */}
      <motion.button
        onClick={() => setSearchOpen(true)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileTap={buttonTap}
        className="lg:hidden fixed top-[max(env(safe-area-inset-top,4px),12px)] right-3 z-15 w-8 h-8 flex items-center justify-center"
        style={{ background: tokens.surface, border, borderRadius: `${tokens.radius.md}px` }}
        aria-label="Rechercher"
      >
        <svg className="w-3 h-3" style={{ color: tokens.textTertiary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </motion.button>

      {/* Top-left buttons */}
      <div className="fixed top-[max(env(safe-area-inset-top,4px),12px)] left-3 z-15 flex gap-1.5">
        <MiniBtn onClick={() => setLegendOpen((p) => !p)} label="Légende">
          <svg className="w-3 h-3" style={{ color: tokens.textTertiary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </MiniBtn>
        <MiniBtn onClick={() => setShowShortcuts(true)} label="Raccourcis" className="hidden lg:flex">
          <svg className="w-3 h-3" style={{ color: tokens.textTertiary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
          </svg>
        </MiniBtn>
      </div>

      {/* Legend */}
      <AnimatePresence>
        {legendOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{ top: '48px', left: '12px', padding: '8px 12px', minWidth: '130px', background: tokens.surface, border, borderRadius: `${tokens.radius.lg}px` }}
            className="fixed z-20"
          >
            {getUniqueTypes(filteredEntries).map((t) => {
              const c = getTypeColor(t.id);
              return (
                <div key={t.id} className="flex items-center gap-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                  <span style={{ fontSize: `${tokens.caption}px`, fontWeight: 500, color: tokens.textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.label}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredEntry && !selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-sm:top-auto max-sm:bottom-24"
          >
            <div style={{ padding: '6px 10px', background: tokens.surface, border, borderRadius: `${tokens.radius.md}px` }} className="max-w-[240px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1 h-1 rounded-full" style={{ background: getTypeColor(hoveredEntry.metadata.type || 'note') }} />
                <span style={{ fontSize: `${tokens.caption}px`, color: tokens.textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{hoveredEntry.metadata.type || 'note'}</span>
              </div>
              <p style={{ fontSize: `${tokens.bodySm}px`, color: tokens.textSecondary, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hoveredEntry.text.slice(0, 100)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sheets */}
      <AnimatePresence>{activeTab === 'filters' && <MobileSheet title="Filtres" onClose={() => setActiveTab(null)}><TypeFilter entries={filteredEntries} activeType={activeType} onTypeChange={(t) => { setActiveType(t); setActiveTab(null); }} /></MobileSheet>}</AnimatePresence>
      <AnimatePresence>{activeTab === 'stats' && <MobileSheet title="Statistiques" onClose={() => setActiveTab(null)}><StatsBadge entries={filteredEntries} lastUpdated={filteredEntries[0]?.metadata.timestamp} big /></MobileSheet>}</AnimatePresence>

      {/* Scene Controls */}
      <SceneControls
        showEdges={showEdges}
        autoRotate={autoRotate}
        onToggleEdges={() => setShowEdges((p) => !p)}
        onToggleAutoRotate={() => setAutoRotate((p) => !p)}
        onResetCamera={handleResetCamera}
        onTimelineChange={setTimelineRange}
        hasTimelineFilter={timelineRange !== null}
      />

      {/* Stats — Desktop */}
      <div className="hidden lg:block"><StatsBadge entries={filteredEntries} lastUpdated={filteredEntries[0]?.metadata.timestamp} /></div>

      {/* Shortcuts */}
      <AnimatePresence>{showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}</AnimatePresence>

      {/* Mobile nav */}
      <BottomSheetNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Search */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay entries={filteredEntries} onSelect={(id) => { setSelectedId(id); setSearchOpen(false); }} onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* Detail */}
      <AnimatePresence>
        {selectedEntry && <DetailPanel entry={selectedEntry} connectedEntries={connectedEntries} onClose={() => setSelectedId(null)} onNavigate={handleNavigate} />}
      </AnimatePresence>
    </main>
  );
}

function MiniBtn({ children, onClick, label, className }: { children: React.ReactNode; onClick: () => void; label: string; className?: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={buttonTap}
      className={`w-8 h-8 flex items-center justify-center ${className || ''}`}
      style={{ background: tokens.surface, border, borderRadius: `${tokens.radius.md}px` }}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}

function MobileSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={spring}
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 rounded-t-xl max-h-[70vh] overflow-y-auto"
      style={{ background: tokens.surface, borderTop: border, paddingBottom: 'env(safe-area-inset-bottom, 16px)', borderRadius: `${tokens.radius.lg}px ${tokens.radius.lg}px 0 0` }}
    >
      <div className="sticky top-0 flex items-center justify-between py-2.5 px-5" style={{ background: tokens.surface, borderBottom: `1px solid ${tokens.border}` }}>
        <span style={{ fontSize: `${tokens.caption}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: tokens.textTertiary }}>{title}</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center" style={{ border: borderLight, borderRadius: `${tokens.radius.sm}px` }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={tokens.textTertiary} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div style={{ padding: '14px 20px' }}>{children}</div>
    </motion.div>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEscape(onClose);
  useBodyScrollLock(true);
  const items = [
    { key: '⌘K', action: 'Recherche' },
    { key: '⌘R', action: 'Rotation auto' },
    { key: 'Escape', action: 'Désélectionner' },
    { key: '?', action: 'Raccourcis' },
  ];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50" style={{ background: '#0c0a0980' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div className="pointer-events-auto p-5" style={{ background: tokens.surface, border, borderRadius: `${tokens.radius.lg}px`, minWidth: '240px' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: `${tokens.caption}px`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: tokens.textTertiary }}>Raccourcis</span>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center" style={{ border: borderLight, borderRadius: `${tokens.radius.sm}px` }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={tokens.textTertiary} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="space-y-2">
            {items.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span style={{ fontSize: `${tokens.bodySm}px`, color: tokens.textSecondary }}>{s.action}</span>
                <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: tokens.raised, border: `1px solid ${tokens.border}`, fontSize: `${tokens.caption}px`, color: tokens.textSecondary }} className="font-mono">{s.key}</kbd>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
