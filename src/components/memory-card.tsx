import { motion } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';
import type { MemoryEntry } from '@/lib/memory-data';
import { tokens } from '@/lib/tokens';

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
  radial-gradient(circle, ${tokens.border} 0.5px, transparent 0.5px)
  8px 8px / 16px 16px
`;

// ─── Shared inline styles ──────────────────────────────────────
const s = {
  label: {
    fontSize: `${tokens.label}px`,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: tokens.textTertiary,
  } as React.CSSProperties,

  value: {
    fontSize: `${tokens.bodySm}px`,
    color: tokens.textSecondary,
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  tile: {
    padding: `${tokens.spacing.px12}px`,
    backgroundColor: tokens.raised,
    borderRadius: `${tokens.radius.md}px`,
    border: `1px solid ${tokens.border}`,
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
        background: `${dotGridBackground}, ${tokens.raised}`,
        border: `1px solid ${tokens.border}`,
        borderRadius: `${tokens.radius.lg}px`,
        padding: compact ? `${tokens.spacing.px14}px` : `${tokens.spacing.px18}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? `${tokens.spacing.px10}px` : `${tokens.spacing.px14}px`,
      }}
      whileHover={{
        borderColor: tokens.borderLight,
        transition: { duration: 0.2 },
      }}
    >
      {/* ─── Header: type dot + icon + label + date ─────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${tokens.spacing.px10}px`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: `${tokens.spacing.px8}px`,
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
              fontSize: `${tokens.bodySm}px`,
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
            fontSize: `${tokens.label}px`,
            color: tokens.textTertiary,
            flexShrink: 0,
          }}
        >
          {relativeTime(timestamp)}
        </span>
      </div>

      {/* ─── Content text ───────────────────────────────── */}
      <p
        style={{
          fontSize: `${tokens.bodySm}px`,
          color: tokens.textPrimary,
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
            gap: `${tokens.spacing.px10}px`,
          }}
        >
          {/* Tile — Type + Tags */}
          <div style={s.tile}>
            <span style={s.label}>Type</span>
            <p style={{ ...s.value, margin: '6px 0 0 0' }}>{icon} {type}</p>

            <span
              style={{
                ...s.label,
                marginTop: `${tokens.spacing.px14}px`,
                display: 'block',
              }}
            >
              Tags
            </span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: `${tokens.spacing.px6}px`,
                marginTop: `${tokens.spacing.px6}px`,
              }}
            >
              <span
                style={{
                  fontSize: `${tokens.label}px`,
                  padding: `2px ${tokens.spacing.px10}px`,
                  borderRadius: `${tokens.radius.md}px`,
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
                    fontSize: `${tokens.label}px`,
                    padding: `2px ${tokens.spacing.px10}px`,
                    borderRadius: `${tokens.radius.md}px`,
                    backgroundColor: tokens.border,
                    color: tokens.textTertiary,
                    border: `1px solid ${tokens.border}`,
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
                marginTop: `${tokens.spacing.px14}px`,
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
