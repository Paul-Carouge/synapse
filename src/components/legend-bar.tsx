'use client';

import { motion } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

const TYPE_ICONS: Record<string, string> = {
  design: '⚙️',
  preference: '💡',
  architecture: '🏛️',
  learning: '📚',
  system: '⚙️',
  note: '📝',
  bug: '🐛',
  decision: '⚖️',
};

function getUniqueTypes(entries: MemoryEntry[]) {
  const seen = new Set<string>();
  const types: { id: string; label: string; color: string }[] = [];
  for (const e of entries) {
    const id = e.metadata.type || 'note';
    if (!seen.has(id)) {
      seen.add(id);
      types.push({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        color: getTypeColor(id),
      });
    }
  }
  return types;
}

export default function LegendBar({
  entries,
  compact,
}: {
  entries: MemoryEntry[];
  compact?: boolean;
}) {
  const types = getUniqueTypes(entries);

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {types.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-2.5"
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: t.color,
                flexShrink: 0,
              }}
            />
            <span className="text-[11px]" style={{ color: '#8a8f98', fontWeight: 500 }}>
              {TYPE_ICONS[t.id] ?? '📄'}
            </span>
            <span className="text-[11px]" style={{ color: '#62666d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t.label}
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 left-6 z-10"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(35,37,42,0.6)',
          backgroundColor: 'rgba(15,16,17,0.7)',
        }}
      >
        {types.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: t.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
