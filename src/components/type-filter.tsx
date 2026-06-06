'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

interface TypeCount {
  id: string;
  label: string;
  color: string;
  count: number;
}

const TYPE_EMOJIS: Record<string, string> = {
  all: '✦',
  design: '⚙️',
  preference: '💡',
  architecture: '🏛️',
  learning: '📚',
  system: '⚙️',
  note: '📝',
  bug: '🐛',
  decision: '⚖️',
};

const TYPE_LABELS: Record<string, string> = {
  design: 'Design',
  preference: 'Preference',
  architecture: 'Architecture',
  learning: 'Learning',
  system: 'System',
  note: 'Note',
  bug: 'Bug',
  decision: 'Decision',
};

function buildTypeCounts(entries: MemoryEntry[]): TypeCount[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const t = e.metadata.type || 'note';
    counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts).map(([id, count]) => ({
    id,
    label: TYPE_LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1),
    color: getTypeColor(id),
    count,
  }));
}

export default function TypeFilter({
  entries,
  activeType,
  onTypeChange,
}: {
  entries: MemoryEntry[];
  activeType: string | null;
  onTypeChange: (type: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const types = buildTypeCounts(entries);

  const updateScrollIndicators = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener('scroll', updateScrollIndicators);
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      ro.disconnect();
    };
  }, [types]);

  const chipVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 18,
        delay: i * 0.04,
      },
    }),
  } as const;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '4px 0',
      }}
    >
      {/* Scroll-fade edge indicators */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 32,
          zIndex: 2,
          pointerEvents: 'none',
          background: canScrollLeft
            ? 'linear-gradient(to right, rgba(7,7,8,0.85) 0%, transparent 100%)'
            : 'transparent',
          transition: 'background 0.3s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 32,
          zIndex: 2,
          pointerEvents: 'none',
          background: canScrollRight
            ? 'linear-gradient(to left, rgba(7,7,8,0.85) 0%, transparent 100%)'
            : 'transparent',
          transition: 'background 0.3s ease',
        }}
      />

      {/* Scrollable chip container */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          padding: '4px 0',
          scrollbarWidth: 'none',
        }}
        className="no-scrollbar"
      >
        {/* All chip */}
        <motion.button
          key="all"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={chipVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTypeChange(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            scrollSnapAlign: 'start',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '8px 14px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: activeType === null ? '1px solid rgba(245,158,11,0.6)' : '1px solid rgba(35,37,42,0.8)',
            backgroundColor: activeType === null ? 'rgba(245,158,11,0.12)' : 'rgba(15,16,17,0.85)',
            color: activeType === null ? '#f59e0b' : '#62666d',
            boxShadow: activeType === null ? '0 0 16px rgba(245,158,11,0.2)' : 'none',
            transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <span style={{ fontSize: '14px', lineHeight: 1 }}>{TYPE_EMOJIS.all}</span>
          <span>Tous</span>
          <span
            style={{
              fontSize: '10px',
              opacity: 0.6,
              marginLeft: '2px',
            }}
          >
            {entries.length}
          </span>
        </motion.button>

        {/* Type chips */}
        {types.map((t, i) => (
          <motion.button
            key={t.id}
            custom={i + 1}
            initial="hidden"
            animate="visible"
            variants={chipVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTypeChange(activeType === t.id ? null : t.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '8px 14px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: activeType === t.id
                ? `1px solid ${t.color}66`
                : '1px solid rgba(35,37,42,0.8)',
              backgroundColor: activeType === t.id
                ? `${t.color}18`
                : 'rgba(15,16,17,0.85)',
              color: activeType === t.id ? t.color : '#62666d',
              boxShadow: activeType === t.id
                ? `0 0 16px ${t.color}22`
                : 'none',
              transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>
              {TYPE_EMOJIS[t.id] ?? '📄'}
            </span>
            <span>{t.label}</span>
            <span
              style={{
                fontSize: '10px',
                opacity: 0.6,
                marginLeft: '2px',
              }}
            >
              {t.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Hide scrollbar globally */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
