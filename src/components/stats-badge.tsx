'use client';

import { useMemo } from 'react';
import type { MemoryEntry } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';

export default function StatsBadge({
  entries,
  lastUpdated,
  big,
}: {
  entries: MemoryEntry[];
  lastUpdated?: string;
  big?: boolean;
}) {
  const edgeCount = useMemo(() => Math.round(entries.length * 1.2), [entries.length]);

  if (big) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#161718] rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-[#f7f8f8] font-mono">{entries.length}</div>
            <div className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mt-1">Nœuds</div>
          </div>
          <div className="flex-1 bg-[#161718] rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-[#f7f8f8] font-mono">{edgeCount}</div>
            <div className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mt-1">Liens</div>
          </div>
          <div className="flex-1 bg-[#161718] rounded-xl p-4 text-center">
            <div className="text-2xl font-semibold text-[#f7f8f8] font-mono">
              {entries.filter(e => e.metadata.type).length}
            </div>
            <div className="text-[10px] text-[#62666d] uppercase tracking-[0.06em] mt-1">Types</div>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-[10px] text-[#52525b] text-center font-mono">
            Dernière mise à jour : {relativeTime(lastUpdated)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-10">
      <div className="bg-[#0f1011]/80 border border-[#23252a]/60 rounded-xl px-3.5 py-2
        text-[10px] text-[#62666d] font-mono flex items-center gap-2">
        <span className="flex items-center gap-1">
          <span className="text-[#8a8f98]">{entries.length}</span>
          <span className="text-[#52525b]">nœuds</span>
        </span>
        <span className="text-[#3a3a3e]">·</span>
        <span className="flex items-center gap-1">
          <span className="text-[#8a8f98]">{edgeCount}</span>
          <span className="text-[#52525b]">liens</span>
        </span>
        {lastUpdated && (
          <>
            <span className="text-[#3a3a3e]">·</span>
            <span className="text-[#52525b]">{relativeTime(lastUpdated)}</span>
          </>
        )}
      </div>
    </div>
  );
}
