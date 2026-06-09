import { motion } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';
import type { MemoryEntry } from '@/lib/memory-data';

// ─── Color tokens ──────────────────────────────────────────────
const colors = {
  surface: '#151718',
  border: '#1e1f22',
  textPrimary: '#ededef',
  textSecondary: '#d4d4d8',
  textTertiary: '#8a8f98',
  accent: '#f59e0b',
};

// ─── Type icons ─────────────────────────────────────────────────
const TYPE_ICONS: Record<string, string> = {
  architecture: '⌘',
  bug: '⚠',
  decision: '✓',
  learning: '○',
  preference: '♥',
  system: '⊞',
  note: '≡',
  design: '◇',
};

// ─── Dot-grid background helper ──────────────────────────────
const dotGridBackground = `
  radial-gradient(circle, ${colors.border} 0.5px, transparent 0.5px)
  8px 8px / 16px 16px
`;

// ─── Shared inline styles ──────────────────────────────────────
const s = {
  // Label tag style (uppercase, tiny, tertiary)
  label: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: colors.textTertiary,
  } as React.CSSProperties,

  // Value text style
  value: {
    fontSize: '13px',
    color: colors.textSecondary,
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  // Info tile for the metadata grid
  tile: {
    padding: '12px',
    backgroundColor: 'rgba(30, 31, 34, 0.5)',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,
};

// ─── Component ──────────────────────────────────────────────────
export default function MemoryCard({
  entry,
  compact,
  expanded,
}: {
  entry: MemoryEntry;
  compact?: boolean;
  expanded?: boolean;
}) {
  const type = entry.metadata.type || 'note';
  const color = getTypeColor(type);
  const icon = TYPE_ICONS[type] ?? '≡';
  const project = entry.metadata.project;
  const timestamp = entry.metadata.timestamp || '';

  const showDetails = expanded || (!compact && true);

  return (
    <motion.div
      style={{
        background: `${dotGridBackground}, ${colors.surface}`,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: compact ? '14px' : '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '10px' : '14px',
      }}
      whileHover={{
        borderColor: 'rgba(237, 237, 239, 0.08)',
        transition: { duration: 0.2 },
      }}
    >
      {/* ─── Header: type dot + icon + label + date ─────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color,
              letterSpacing: '0.02em',
            }}
          >
            {icon} {type}
          </span>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: colors.textTertiary,
            flexShrink: 0,
          }}
        >
          {relativeTime(timestamp)}
        </span>
      </div>

      {/* ─── Content text ───────────────────────────────── */}
      <p
        style={{
          fontSize: '13px',
          color: colors.textPrimary,
          lineHeight: '1.65',
          letterSpacing: '-0.01em',
          margin: 0,
        }}
      >
        {compact && entry.text.length > 100
          ? entry.text.slice(0, 100) + '…'
          : entry.text}
      </p>

      {/* ─── Metadata grid (expanded / default) ─────────── */}
      {showDetails && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          {/* Tile — Type + Tags */}
          <div style={s.tile}>
            <span style={s.label}>Type</span>
            <p style={{ ...s.value, margin: '6px 0 0 0' }}>{icon} {type}</p>

            <span
              style={{
                ...s.label,
                marginTop: '14px',
                display: 'block',
              }}
            >
              Tags
            </span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 10px',
                  borderRadius: '6px',
                  backgroundColor: `${color}15`,
                  color,
                  border: `1px solid ${color}30`,
                }}
              >
                {type}
              </span>
              {project && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 10px',
                    borderRadius: '6px',
                    backgroundColor: colors.border,
                    color: colors.textTertiary,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {project}
                </span>
              )}
            </div>
          </div>

          {/* Tile — Project + Date */}
          <div style={s.tile}>
            <span style={s.label}>Project</span>
            <p style={{ ...s.value, margin: '6px 0 0 0' }}>
              {project || '—'}
            </p>

            <span
              style={{
                ...s.label,
                marginTop: '14px',
                display: 'block',
              }}
            >
              Date
            </span>
            <p style={{ ...s.value, margin: '6px 0 0 0' }}>
              {relativeTime(timestamp)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
