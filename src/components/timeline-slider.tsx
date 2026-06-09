'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spring, buttonTap } from '@/lib/motion';
import type { MemoryEntry } from '@/lib/memory-data';

interface TimelineSliderProps {
  entries: MemoryEntry[];
  active: boolean;
  onRangeChange: (range: { start: number; end: number } | null) => void;
}

export default function TimelineSlider({
  entries,
  active,
  onRangeChange,
}: TimelineSliderProps) {
  const [minPercent, setMinPercent] = useState(0);
  const [maxPercent, setMaxPercent] = useState(100);
  const [showPanel, setShowPanel] = useState(active);

  // Compute time boundaries from data
  const timeBounds = useMemo(() => {
    let minTime = Infinity;
    let maxTime = 0;
    for (const e of entries) {
      if (e.metadata.timestamp) {
        const t = new Date(e.metadata.timestamp).getTime();
        if (t < minTime) minTime = t;
        if (t > maxTime) maxTime = t;
      }
    }
    if (!isFinite(minTime) || minTime === Infinity) {
      const now = Date.now();
      return { minTime: now - 86400000 * 30, maxTime: now };
    }
    // Add padding
    const range = maxTime - minTime;
    return {
      minTime: minTime - range * 0.05,
      maxTime: maxTime + range * 0.05,
    };
  }, [entries]);

  const { minTime, maxTime } = timeBounds;
  const totalRange = maxTime - minTime;

  const formatDate = useCallback((percent: number) => {
    const t = minTime + (percent / 100) * totalRange;
    const d = new Date(t);
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, [minTime, totalRange]);

  const applyRange = useCallback(() => {
    const start = minTime + (minPercent / 100) * totalRange;
    const end = minTime + (maxPercent / 100) * totalRange;
    onRangeChange({ start, end });
  }, [minPercent, maxPercent, minTime, totalRange, onRangeChange]);

  const clearFilter = useCallback(() => {
    setMinPercent(0);
    setMaxPercent(100);
    onRangeChange(null);
  }, [onRangeChange]);

  // Count entries in each 10% bucket for histogram
  const histogram = useMemo(() => {
    const buckets = new Array(10).fill(0);
    for (const e of entries) {
      if (e.metadata.timestamp) {
        const t = new Date(e.metadata.timestamp).getTime();
        const p = ((t - minTime) / totalRange) * 100;
        const idx = Math.min(9, Math.floor(p / 10));
        buckets[idx]++;
      }
    }
    const max = Math.max(1, ...buckets);
    return buckets.map((c) => (c / max) * 100);
  }, [entries, minTime, totalRange]);

  // Stats for current range
  const visibleCount = useMemo(() => {
    if (minPercent === 0 && maxPercent === 100) return entries.length;
    const start = minTime + (minPercent / 100) * totalRange;
    const end = minTime + (maxPercent / 100) * totalRange;
    return entries.filter((e) => {
      if (!e.metadata.timestamp) return true;
      const t = new Date(e.metadata.timestamp).getTime();
      return t >= start && t <= end;
    }).length;
  }, [entries, minPercent, maxPercent, minTime, totalRange]);

  const hasChanged = minPercent > 0 || maxPercent < 100;

  return (
    <div
      className="hidden lg:block"
      style={{
        position: 'fixed',
        bottom: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: active ? 1 : 0.6,
          y: active ? 0 : 4,
        }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          padding: '14px 18px 10px',
          borderRadius: '14px',
          backgroundColor: 'rgba(15,16,17,0.92)',
          border: '1px solid rgba(35,37,42,0.6)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          minWidth: '420px',
          cursor: active ? 'default' : 'pointer',
        }}
        onClick={() => {
          if (!active) {
            setShowPanel(true);
            onRangeChange({ start: minTime, end: maxTime });
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#62666d' }}>
              Timeline
            </span>
            {hasChanged && (
              <span className="text-[10px] text-[#f59e0b] font-mono">
                {visibleCount}/{entries.length}
              </span>
            )}
          </div>
          {hasChanged && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); clearFilter(); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#1a1a1e',
                border: '1px solid #27272a',
                color: '#8a8f98',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              Réinitialiser
            </motion.button>
          )}
        </div>

        {/* Histogram bars */}
        <div className="flex items-end gap-[3px]" style={{ height: '20px', marginBottom: '8px' }}>
          {histogram.map((h, i) => {
            const barStart = i * 10;
            const barEnd = (i + 1) * 10;
            const isInRange = barEnd > minPercent && barStart < maxPercent;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(4, h * 0.7)}%`,
                  borderRadius: '2px',
                  backgroundColor: isInRange ? 'rgba(245,158,11,0.3)' : 'rgba(35,37,42,0.5)',
                  transition: 'background-color 0.2s',
                }}
              />
            );
          })}
        </div>

        {/* Range slider track */}
        <div className="relative" style={{ height: '20px' }}>
          {/* Track background */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '2px',
              borderRadius: '1px',
              backgroundColor: '#23252a',
            }}
          />

          {/* Active range */}
          <div
            style={{
              position: 'absolute',
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '3px',
              borderRadius: '1.5px',
              backgroundColor: '#f59e0b',
            }}
          />

          {/* Min handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${minPercent}%`, zIndex: 2 }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-[#f59e0b] bg-[#0f1011] cursor-ew-resize"
              style={{ boxShadow: '0 0 8px rgba(245,158,11,0.3)' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startPercent = minPercent;
                const trackWidth = (e.currentTarget.parentElement!.parentElement as HTMLElement).offsetWidth;

                const onMove = (ev: MouseEvent) => {
                  const dx = ((ev.clientX - startX) / trackWidth) * 100;
                  const newVal = Math.max(0, Math.min(maxPercent - 5, startPercent + dx));
                  setMinPercent(newVal);
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                  applyRange();
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            />
          </div>

          {/* Max handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 translate-x-1/2"
            style={{ left: `${maxPercent}%`, zIndex: 2 }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-[#f59e0b] bg-[#0f1011] cursor-ew-resize"
              style={{ boxShadow: '0 0 8px rgba(245,158,11,0.3)' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startPercent = maxPercent;
                const trackWidth = (e.currentTarget.parentElement!.parentElement as HTMLElement).offsetWidth;

                const onMove = (ev: MouseEvent) => {
                  const dx = ((ev.clientX - startX) / trackWidth) * 100;
                  const newVal = Math.min(100, Math.max(minPercent + 5, startPercent + dx));
                  setMaxPercent(newVal);
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                  applyRange();
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            />
          </div>
        </div>

        {/* Date labels */}
        <div className="flex items-center justify-between" style={{ marginTop: '6px' }}>
          <span className="text-[9px] text-[#52525b] font-mono">{formatDate(minPercent)}</span>
          <span className="text-[9px] text-[#52525b] font-mono">{formatDate(maxPercent)}</span>
        </div>
      </motion.div>
    </div>
  );
}
