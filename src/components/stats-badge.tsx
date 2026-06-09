'use client';

import { useMemo } from 'react';
import type { MemoryEntry } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';

const BORDER = '1px solid rgba(30,31,34,0.8)';
const SURFACE = 'rgba(15,16,17,0.92)';

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
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {[
            { label: 'Nœuds', value: entries.length },
            { label: 'Liens', value: edgeCount },
            { label: 'Types', value: entries.filter(e => e.metadata.type).length },
          ].map((s) => (
            <div key={s.label} className="flex-1 rounded-lg text-center" style={{ padding: '12px 8px', background: '#161718', border: '1px solid #1e1f22' }}>
              <div className="text-lg font-semibold text-[#ededef] font-mono">{s.value}</div>
              <div className="text-[9px] text-[#52525b] uppercase tracking-[0.06em] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        {lastUpdated && (
          <p className="text-[9px] text-[#3a3a3e] text-center font-mono">Mis à jour {relativeTime(lastUpdated)}</p>
        )}
      </div>
    );
  }

  return (
    <div className="fixed top-5 right-5 z-10">
      <div style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '9px', color: '#52525b', fontFamily: "'JetBrains Mono Variable', monospace", display: 'flex', alignItems: 'center', gap: '8px', background: SURFACE, border: BORDER }}>
        <span>{entries.length}<span style={{ color: '#3a3a3e' }}> nœuds</span></span>
        <span style={{ color: '#1e1f22' }}>·</span>
        <span>{edgeCount}<span style={{ color: '#3a3a3e' }}> liens</span></span>
        {lastUpdated && (
          <>
            <span style={{ color: '#1e1f22' }}>·</span>
            <span style={{ color: '#3a3a3e' }}>{relativeTime(lastUpdated)}</span>
          </>
        )}
      </div>
    </div>
  );
}
