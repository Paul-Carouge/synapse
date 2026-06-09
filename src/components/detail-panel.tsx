'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import MemoryCard from '@/components/memory-card';
import { getTypeColor } from '@/lib/memory-data';
import { spring, staggerContainer, staggerItem } from '@/lib/motion';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { tokens, border, borderLight } from '@/lib/tokens';
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
  const type = entry.metadata.type || 'note';
  const color = getTypeColor(type);

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 120) onClose();
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-30"
        style={{ backgroundColor: 'rgba(12, 10, 9, 0.6)' }}
      />

      {/* Desktop — slide panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="hidden lg:block fixed right-0 top-0 bottom-0 z-40 w-full max-w-md overflow-y-auto"
        style={{ backgroundColor: tokens.surface, borderLeft: border }}
      >
        <div style={{ padding: `${tokens.spacing.px20}px` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: tokens.textTertiary }}
              >
                Détail
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
              style={{
                border: borderLight,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.raised;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tokens.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <MemoryCard entry={entry} expanded />
          {connectedEntries.length > 0 && (
            <ConnectedSection entries={connectedEntries} onNavigate={onNavigate} />
          )}
        </div>
      </motion.div>

      {/* Mobile — drag sheet */}
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
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 overflow-y-auto rounded-t-xl"
        style={{
          backgroundColor: tokens.surface,
          borderTop: border,
          maxHeight: '85vh',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div
            className="w-7 h-0.5 rounded"
            style={{ backgroundColor: tokens.borderLight }}
          />
        </div>

        {/* Sticky header */}
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-2"
          style={{
            backgroundColor: tokens.surface,
            borderBottom: `1px solid ${tokens.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: tokens.textTertiary }}
            >
              Détail
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs"
            style={{
              padding: `${tokens.spacing.px4}px ${tokens.spacing.px8}px`,
              borderRadius: `${tokens.radius.md}px`,
              border: borderLight,
              color: tokens.textTertiary,
              backgroundColor: 'transparent',
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Fermer
          </button>
        </div>

        <div style={{ padding: `${tokens.spacing.px16}px ${tokens.spacing.px20}px` }}>
          <MemoryCard entry={entry} expanded />
          {connectedEntries.length > 0 && (
            <ConnectedSection entries={connectedEntries} onNavigate={onNavigate} />
          )}
        </div>
      </motion.div>
    </>
  );
}

function ConnectedSection({
  entries,
  onNavigate,
}: {
  entries: MemoryEntry[];
  onNavigate: (id: string) => void;
}) {
  return (
    <div style={{ marginTop: `${tokens.spacing.px20}px` }}>
      <div className="flex items-center gap-1.5 mb-3">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.textTertiary}
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: tokens.textTertiary }}
        >
          Connectées ({entries.length})
        </span>
      </div>

      <div className="space-y-1.5">
        {entries.slice(0, 8).map((connected) => {
          const c = getTypeColor(connected.metadata.type || 'note');
          return (
            <motion.button
              key={connected.id}
              onClick={() => onNavigate(connected.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
              className="w-full text-left"
              style={{
                padding: `${tokens.spacing.px8}px ${tokens.spacing.px10}px`,
                borderRadius: `${tokens.radius.md}px`,
                background: tokens.raised,
                border: `1px solid ${tokens.border}`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: c }}
                />
                <span
                  className="text-[8px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: c }}
                >
                  {connected.metadata.type || 'note'}
                </span>
                {connected.metadata.project && (
                  <span
                    className="text-[8px] px-1.5 rounded"
                    style={{
                      color: tokens.textTertiary,
                      backgroundColor: tokens.raised,
                    }}
                  >
                    {connected.metadata.project}
                  </span>
                )}
              </div>
              <p
                className="text-[10px] leading-relaxed line-clamp-2"
                style={{ color: tokens.textSecondary }}
              >
                {connected.text.slice(0, 120)}
              </p>
            </motion.button>
          );
        })}
        {entries.length > 8 && (
          <p
            className="text-[9px] text-center pt-1"
            style={{ color: tokens.textTertiary }}
          >
            +{entries.length - 8} autres
          </p>
        )}
      </div>
    </div>
  );
}
