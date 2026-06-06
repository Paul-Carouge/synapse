'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuronScene from '@/components/neuron-scene';
import SearchOverlay from '@/components/search-overlay';
import DetailPanel from '@/components/detail-panel';
import TypeFilter from '@/components/type-filter';
import LegendBar from '@/components/legend-bar';
import StatsBadge from '@/components/stats-badge';
import BottomSheetNav from '@/components/bottom-sheet-nav';
import { loadMemoryData, getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';
import { spring, easeOut, fadeIn, scaleIn, buttonTap, buttonHover } from '@/lib/motion';

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
    setActiveTab(null);
  }, []);

  const handleTabChange = useCallback((tab: string | null) => {
    setActiveTab(tab);
    if (tab === 'search') setSearchOpen(true);
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
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-[#f59e0b]"
            style={{ boxShadow: '0 0 12px rgba(245,158,11,0.5)' }}
          />
          <p className="text-sm text-[#62666d]">Connexion à la mémoire...</p>
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
      {/* ── 3D Scene (always fullscreen) ── */}
      <NeuronScene
        entries={entries}
        selectedId={selectedId}
        activeType={activeType}
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

      {/* ── TypeFilter pills — Desktop (top-left) / Mobile (inside drawer) ── */}
      <div className="desktop-filter-bar" style={{ position: 'fixed', top: '80px', left: '24px', zIndex: 10, maxWidth: 'calc(100vw - 300px)' }}>
        <TypeFilter entries={entries} activeType={activeType} onTypeChange={setActiveType} />
      </div>

      {/* ── Search Bar — Desktop (top-center) ── */}
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
          style={{ padding: '12px 20px' }}
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

      {/* ── Search FAB — Mobile only ── */}
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
              <motion.button
                onClick={() => setActiveTab(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={buttonTap}
                className="flex items-center gap-1.5"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#1a1a1e',
                  border: '1px solid #27272a',
                  color: '#8a8f98',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Fermer</span>
              </motion.button>
            </div>
            <div style={{ padding: '20px' }}>
              <TypeFilter entries={entries} activeType={activeType} onTypeChange={(t) => { setActiveType(t); setActiveTab(null); }} />
              <div className="mt-6 pt-4 border-t border-[#23252a]/40">
                <LegendBar entries={entries} compact />
              </div>
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
              <motion.button
                onClick={() => setActiveTab(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={buttonTap}
                className="flex items-center gap-1.5"
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#1a1a1e',
                  border: '1px solid #27272a',
                  color: '#8a8f98',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Fermer</span>
              </motion.button>
            </div>
            <div style={{ padding: '20px' }}>
              <StatsBadge entries={entries} lastUpdated={entries[0]?.metadata.timestamp} big />
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
              max-sm:top-auto max-sm:bottom-24"
          >
            <div style={{ padding: '10px 16px' }} className="bg-[#0f1011] border border-[#23252a]/60 rounded-xl max-w-xs shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getTypeColor(hoveredEntry.metadata.type || 'note') }} />
                <span className="text-[10px] text-[#8a8f98] font-medium uppercase tracking-[0.06em]">
                  {hoveredEntry.metadata.type || 'note'}
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-1">
                {hoveredEntry.text.slice(0, 100)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LegendBar — Desktop only ── */}
      <div className="hidden lg:block">
        <LegendBar entries={entries} />
      </div>

      {/* ── StatsBadge — Desktop only ── */}
      <div className="hidden lg:block">
        <StatsBadge entries={entries} lastUpdated={entries[0]?.metadata.timestamp} />
      </div>

      {/* ── Bottom Sheet Navigation — Mobile only ── */}
      <BottomSheetNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            entries={entries}
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
            onClose={() => setSelectedId(null)}
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
