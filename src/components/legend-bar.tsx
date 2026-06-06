'use client';

import { getTypeColor } from '@/lib/memory-data';
import type { MemoryEntry } from '@/lib/memory-data';

export default function LegendBar({
  entries,
}: {
  entries: MemoryEntry[];
}) {
  const types = getUniqueTypes(entries);

  return (
    <div className="fixed bottom-6 left-6 z-10">
      <div style={{ padding: '8px 14px' }} className="bg-[#0f1011]/80 border border-[#23252a]/60 rounded-xl flex items-center gap-3">
        {types.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span className="text-[9px] text-[#62666d] uppercase tracking-[0.06em] font-medium">
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getUniqueTypes(entries: MemoryEntry[]) {
  const seen = new Set<string>();
  const types: { id: string; label: string; color: string }[] = [];
  for (const e of entries) {
    const id = e.metadata.type || 'note';
    if (!seen.has(id)) {
      seen.add(id);
      types.push({ id, label: id.charAt(0).toUpperCase() + id.slice(1), color: getTypeColor(id) });
    }
  }
  return types;
}
