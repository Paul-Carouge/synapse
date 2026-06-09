'use client';

import { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { MemoryEntry } from '@/lib/memory-data';
import { tokens } from '@/lib/tokens';

interface TimelineSliderProps {
  entries: MemoryEntry[];
  active: boolean;
  onRangeChange: (range: { start: number; end: number } | null) => void;
}

export default function TimelineSlider({ entries, active, onRangeChange }: TimelineSliderProps) {
  const [minPercent, setMinPercent] = useState(0);
  const [maxPercent, setMaxPercent] = useState(100);

  const timeBounds = useMemo(() => {
    let minTime = Infinity, maxTime = 0;
    for (const e of entries) {
      if (e.metadata.timestamp) {
        const t = new Date(e.metadata.timestamp).getTime();
        if (t < minTime) minTime = t;
        if (t > maxTime) maxTime = t;
      }
    }
    if (!isFinite(minTime)) {
      const now = Date.now();
      return { minTime: now - 86400000 * 30, maxTime: now };
    }
    const range = maxTime - minTime;
    return { minTime: minTime - range * 0.05, maxTime: maxTime + range * 0.05 };
  }, [entries]);

  const { minTime, maxTime } = timeBounds;
  const totalRange = maxTime - minTime;

  const formatDate = useCallback((percent: number) => {
    const t = minTime + (percent / 100) * totalRange;
    const d = new Date(t);
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }, [minTime, totalRange]);

  const applyRange = useCallback(() => {
    onRangeChange({
      start: minTime + (minPercent / 100) * totalRange,
      end: minTime + (maxPercent / 100) * totalRange,
    });
  }, [minPercent, maxPercent, minTime, totalRange, onRangeChange]);

  const clearFilter = useCallback(() => {
    setMinPercent(0);
    setMaxPercent(100);
    onRangeChange(null);
  }, [onRangeChange]);

  const histogram = useMemo(() => {
    const buckets = new Array(10).fill(0);
    for (const e of entries) {
      if (e.metadata.timestamp) {
        const t = new Date(e.metadata.timestamp).getTime();
        const p = ((t - minTime) / totalRange) * 100;
        buckets[Math.min(9, Math.floor(p / 10))]++;
      }
    }
    const max = Math.max(1, ...buckets);
    return buckets.map((c) => (c / max) * 100);
  }, [entries, minTime, totalRange]);

  const hasChanged = minPercent > 0 || maxPercent < 100;
  const visibleCount = useMemo(() => {
    if (!hasChanged) return entries.length;
    const start = minTime + (minPercent / 100) * totalRange;
    const end = minTime + (maxPercent / 100) * totalRange;
    return entries.filter((e) => {
      if (!e.metadata.timestamp) return true;
      const t = new Date(e.metadata.timestamp).getTime();
      return t >= start && t <= end;
    }).length;
  }, [entries, minPercent, maxPercent, minTime, totalRange, hasChanged]);

  return (
    <div className="hidden lg:block" style={{ position: 'fixed', bottom: '64px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0.5, y: active ? 0 : 4 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          padding: `${tokens.spacing.px12}px ${tokens.spacing.px16}px ${tokens.spacing.px8}px`,
          borderRadius: `${tokens.radius.lg}px`,
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
          minWidth: '380px',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={tokens.accent} strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                fontSize: `${tokens.caption}px`,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: tokens.textTertiary,
              }}
            >
              Timeline
            </span>
            {hasChanged && (
              <span style={{ fontSize: `${tokens.caption}px`, color: tokens.accent, fontFamily: "'JetBrains Mono Variable', monospace" }}>
                {visibleCount}/{entries.length}
              </span>
            )}
          </div>
          {hasChanged && (
            <button
              onClick={(e) => { e.stopPropagation(); clearFilter(); }}
              style={{
                fontSize: `${tokens.caption}px`,
                color: tokens.textTertiary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = tokens.textSecondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = tokens.textTertiary; }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Histogram */}
        <div className="flex items-end gap-[2px]" style={{ height: '16px', marginBottom: '6px' }}>
          {histogram.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(3, h * 0.6)}%`,
                borderRadius: `${tokens.radius.sm}px`,
                backgroundColor: i * 10 >= minPercent && (i + 1) * 10 <= maxPercent
                  ? tokens.accentSubtle
                  : tokens.border,
              }}
            />
          ))}
        </div>

        {/* Slider */}
        <div className="relative" style={{ height: '18px' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '2px',
              borderRadius: `${tokens.radius.sm}px`,
              backgroundColor: tokens.border,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '2px',
              borderRadius: `${tokens.radius.sm}px`,
              backgroundColor: tokens.accent,
            }}
          />
          <Handle pos={minPercent} onDrag={(v) => setMinPercent(Math.max(0, Math.min(maxPercent - 5, v)))} onEnd={applyRange} />
          <Handle pos={maxPercent} onDrag={(v) => setMaxPercent(Math.min(100, Math.max(minPercent + 5, v)))} onEnd={applyRange} />
        </div>

        <div className="flex items-center justify-between mt-1">
          <span style={{ fontSize: '8px', color: tokens.textTertiary, fontFamily: "'JetBrains Mono Variable', monospace" }}>
            {formatDate(minPercent)}
          </span>
          <span style={{ fontSize: '8px', color: tokens.textTertiary, fontFamily: "'JetBrains Mono Variable', monospace" }}>
            {formatDate(maxPercent)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Handle({ pos, onDrag, onEnd }: { pos: number; onDrag: (v: number) => void; onEnd: () => void }) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pos}%`, zIndex: 2 }}>
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: `${tokens.radius.md}px`,
          border: `2px solid ${tokens.accent}`,
          backgroundColor: tokens.deep,
          cursor: 'ew-resize',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startPercent = pos;
          const track = (e.currentTarget.parentElement!.parentElement as HTMLElement).offsetWidth;
          const onMove = (ev: MouseEvent) => onDrag(startPercent + ((ev.clientX - startX) / track) * 100);
          const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); onEnd(); };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        }}
      />
    </div>
  );
}
