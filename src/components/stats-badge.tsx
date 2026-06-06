'use client';

import { useMemo } from 'react';
import type { MemoryEntry } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';

export default function StatsBadge({
  entries,
  lastUpdated,
}: {
  entries: MemoryEntry[];
  lastUpdated?: string;
}) {
  const edgeCount = useMemo(() => estimateEdgeCount(entries.length), [entries.length]);

  return (
    <div className="fixed top-6 right-6 z-10">
      <div className="bg-[#0f1011]/80 border border-[#23252a]/60 rounded-xl px-3.5 py-2
        text-[10px] text-[#62666d] font-mono tracking-[0.01em] flex items-center gap-2">
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

function estimateEdgeCount(nodeCount: number): number {
  // Crude estimate: each node connects to ~2.5 others on average
  return Math.round(nodeCount * 1.2);
}
