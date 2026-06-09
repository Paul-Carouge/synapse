'use client';

import { useMemo } from 'react';
import type { MemoryEntry } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';
import { tokens } from '@/lib/tokens';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { label: 'Nœuds', value: entries.length },
            { label: 'Liens', value: edgeCount },
            { label: 'Types', value: entries.filter(e => e.metadata.type).length },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: tokens.raised,
                border: `1px solid ${tokens.border}`,
                borderRadius: `${tokens.radius.lg}px`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: tokens.textPrimary,
                  fontFamily: "'JetBrains Mono Variable', monospace",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: `${tokens.caption}px`,
                  color: tokens.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: '2px',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
        {lastUpdated && (
          <p
            style={{
              fontSize: `${tokens.caption}px`,
              color: tokens.textTertiary,
              textAlign: 'center',
              fontFamily: "'JetBrains Mono Variable', monospace",
              margin: 0,
            }}
          >
            Mis à jour {relativeTime(lastUpdated)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10 }}>
      <div
        style={{
          padding: `${tokens.spacing.px6}px ${tokens.spacing.px12}px`,
          borderRadius: `${tokens.radius.md}px`,
          fontSize: `${tokens.caption}px`,
          color: tokens.textTertiary,
          fontFamily: "'JetBrains Mono Variable', monospace",
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
        }}
      >
        <span>
          {entries.length}
          <span style={{ color: tokens.textTertiary }}> nœuds</span>
        </span>
        <span style={{ color: tokens.border }}>·</span>
        <span>
          {edgeCount}
          <span style={{ color: tokens.textTertiary }}> liens</span>
        </span>
        {lastUpdated && (
          <>
            <span style={{ color: tokens.border }}>·</span>
            <span style={{ color: tokens.textTertiary }}>{relativeTime(lastUpdated)}</span>
          </>
        )}
      </div>
    </div>
  );
}
