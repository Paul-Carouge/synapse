'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import MemoryCard from '@/components/memory-card';
import { useEscape } from '@/hooks/useEscape';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { MemoryEntry } from '@/lib/memory-data';

export default function DetailPanel({
  entry,
  onClose,
}: {
  entry: MemoryEntry;
  onClose: () => void;
}) {
  useEscape(onClose);
  useBodyScrollLock(true);

  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 150) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay avec backdrop blur */}
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
          {/* Header avec bouton fermeture animé */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: '20px' }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: '#62666d' }}
            >
              Détail mémoire
            </span>
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <MemoryCard entry={entry} expanded />
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
        {/* Handle de drag (barre horizontale fine) */}
        <div className="flex justify-center" style={{ padding: '12px 0 4px' }}>
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: '#3a3a3e',
            }}
          />
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
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: '#62666d' }}
          >
            Détail
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-transform duration-300 hover:rotate-90"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#1a1a1e',
              border: '1px solid #27272a',
              color: '#8a8f98',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div style={{ padding: '20px' }}>
          <MemoryCard entry={entry} expanded />
        </div>
      </motion.div>
    </>
  );
}
