'use client';

import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

interface TypeCount {
  id: string;
  label: string;
  color: string;
  count: number;
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
    <div className="fixed top-6 left-6 z-10 flex gap-1.5">
      {/* Mode "Tous" — subtle pill */}
      <button
        onClick={() => onTypeChange(null)}
        className={`
          inline-flex items-center gap-1.5
          px-3 py-1.5 rounded-full
          text-[10px] font-medium uppercase tracking-[0.06em]
          transition-all duration-200 ease-out
          ${
            activeType === null
              ? 'bg-[#f59e0b] text-[#070708] shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              : 'bg-[#0f1011] text-[#62666d] border border-[#23252a] hover:border-[#f59e0b]/20 hover:text-[#8a8f98]'
          }
        `}
      >
        Tous
        <span className="text-[9px] opacity-60 ml-0.5">{entries.length}</span>
      </button>

      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onTypeChange(activeType === t.id ? null : t.id)}
          className={`
            inline-flex items-center gap-1.5
            px-3 py-1.5 rounded-full
            text-[10px] font-medium uppercase tracking-[0.06em]
            transition-all duration-200 ease-out
            ${
              activeType === t.id
                ? 'shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-[#0f1011] text-[#62666d] border border-[#23252a] hover:border-[#f59e0b]/20 hover:text-[#8a8f98]'
            }
          `}
          style={{
            backgroundColor: activeType === t.id ? t.color + '22' : '',
            color: activeType === t.id ? t.color : '',
            borderColor: activeType === t.id ? t.color + '44' : '',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: t.color }}
          />
          {t.label}
          <span className="text-[9px] opacity-60 ml-0.5">{t.count}</span>
        </button>
      ))}
    </div>
  );
}

function buildTypeCounts(entries: MemoryEntry[]): TypeCount[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const t = e.metadata.type || 'note';
    counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts).map(([id, count]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    color: getTypeColor(id),
    count,
  }));
}
