'use client';

import { motion } from 'framer-motion';
import { spring } from '@/lib/motion';
import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';
import { tokens } from '@/lib/tokens';

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

function FilterChip({
  icon,
  label,
  count,
  isActive,
  activeColor,
  onToggle,
  delay,
}: {
  icon: string;
  label: string;
  count: number;
  isActive: boolean;
  activeColor: string;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay }}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        flexShrink: 0,
        scrollSnapAlign: 'start',
        padding: `${tokens.spacing.px6}px ${tokens.spacing.px12}px`,
        borderRadius: `${tokens.radius.md}px`,
        cursor: 'pointer',
        border: isActive
          ? `1px solid ${activeColor}`
          : `0.5px solid ${tokens.border}`,
        backgroundColor: isActive
          ? tokens.accentSubtle
          : 'transparent',
        color: isActive ? activeColor : tokens.textTertiary,
        fontSize: `${tokens.label}px`,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        transition: 'border-color 0.2s, background-color 0.2s, color 0.2s',
      }}
    >
      <span style={{ fontSize: '12px', lineHeight: 1, opacity: isActive ? 1 : 0.6 }}>
        {icon}
      </span>
      <span>{label}</span>
      <span
        style={{
          fontSize: `${tokens.caption}px`,
          fontWeight: 700,
          opacity: 0.45,
          marginLeft: '1px',
        }}
      >
        {count}
      </span>
    </motion.button>
  );
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
  const types = buildTypeCounts(entries);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '5px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          padding: '4px 0',
          scrollbarWidth: 'none',
        }}
        className="no-scrollbar"
      >
        <FilterChip
          icon={TYPE_EMOJIS.all}
          label="Tous"
          count={entries.length}
          isActive={activeType === null}
          activeColor={tokens.accent}
          onToggle={() => onTypeChange(null)}
          delay={0}
        />

        {types.map((t, i) => (
          <FilterChip
            key={t.id}
            icon={TYPE_EMOJIS[t.id] ?? '📄'}
            label={t.label}
            count={t.count}
            isActive={activeType === t.id}
            activeColor={t.color}
            onToggle={() => onTypeChange(activeType === t.id ? null : t.id)}
            delay={(i + 1) * 0.035}
          />
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
