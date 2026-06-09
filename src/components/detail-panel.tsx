'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import MemoryCard from '@/components/memory-card';
import { getTypeColor } from '@/lib/memory-data';
import { spring, staggerContainer, staggerItem } from '@/lib/motion';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { MemoryEntry } from '@/lib/memory-data';

export default function DetailPanel({
  entry,
  connectedEntries,
  onClose,
  onNavigate,
}: {
  entry: MemoryEntry;
  connectedEntries: MemoryEntry[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  useEscape(onClose);
  useBodyScrollLock(true);

  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 150) {
      onClose();
    }
  };

  const type = entry.metadata.type || 'note';
  const color = getTypeColor(type);

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30"
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Desktop : slide depuis la droite */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="hidden lg:block fixed right-0 top-0 bottom-0 z-40 w-full max-w-md overflow-y-auto"
        style={{
          backgroundColor: '#0f1011',
          borderLeft: '1px solid rgba(35,37,42,0.8)',
          boxShadow: '-8px 0 32px -12px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#62666d' }}>
                Détail mémoire
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center transition-transform duration-300 hover:rotate-90"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#1a1a1e',
                border: '1px solid #27272a',
                color: '#8a8f98',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <MemoryCard entry={entry} expanded />

          {/* Connected memories */}
          {connectedEntries.length > 0 && (
            <ConnectedSection
              entries={connectedEntries}
              onNavigate={onNavigate}
              color={color}
            />
          )}
        </div>
      </motion.div>

      {/* Mobile : bottom sheet avec drag-to-close */}
      <motion.div
        ref={sheetRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 overflow-y-auto"
        style={{
          backgroundColor: '#0f1011',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          maxHeight: '85vh',
          borderTop: '1px solid rgba(35,37,42,0.6)',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center" style={{ padding: '12px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: '#3a3a3e' }} />
        </div>

        {/* Header sticky */}
        <div
          className="sticky top-0 flex items-center justify-between"
          style={{
            padding: '4px 20px 12px',
            backgroundColor: '#0f1011',
            borderBottom: '1px solid rgba(35,37,42,0.4)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#62666d' }}>
              Détail
            </span>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 transition-colors"
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

        {/* Contenu */}
        <div style={{ padding: '20px' }}>
          <MemoryCard entry={entry} expanded />

          {connectedEntries.length > 0 && (
            <ConnectedSection
              entries={connectedEntries}
              onNavigate={onNavigate}
              color={color}
            />
          )}
        </div>
      </motion.div>
    </>
  );
}

function ConnectedSection({
  entries,
  onNavigate,
  color,
}: {
  entries: MemoryEntry[];
  onNavigate: (id: string) => void;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      style={{ marginTop: '24px' }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#62666d' }}>
          Mémoires connectées ({entries.length})
        </span>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {entries.slice(0, 8).map((connected) => {
          const connType = connected.metadata.type || 'note';
          const connColor = getTypeColor(connType);
          return (
            <motion.button
              key={connected.id}
              variants={staggerItem}
              onClick={() => onNavigate(connected.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left"
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(22,23,24,0.8)',
                border: '1px solid rgba(35,37,42,0.5)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${connColor}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(35,37,42,0.5)';
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: connColor }} />
                <span className="text-[9px] font-medium uppercase tracking-[0.06em]" style={{ color: connColor }}>
                  {connType}
                </span>
                {connected.metadata.project && (
                  <span style={{ padding: '1px 6px' }} className="text-[9px] text-[#62666d] rounded-md bg-[#23252a]">
                    {connected.metadata.project}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8a8f98] leading-relaxed line-clamp-2">
                {connected.text.slice(0, 120)}
              </p>
            </motion.button>
          );
        })}
        {entries.length > 8 && (
          <p className="text-[10px] text-center text-[#52525b] pt-1">
            +{entries.length - 8} autres connexions
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
