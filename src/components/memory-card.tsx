import { motion } from 'framer-motion';
import { getTypeColor } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';
import type { MemoryEntry } from '@/lib/memory-data';

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
      className="grid gap-4"
      style={{
        gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        backgroundColor: '#151718',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: compact ? '16px' : '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
        transition: { duration: 0.2 },
      }}
    >
      {/* Header — full width : icône + type + date */}
      <div
        className="col-span-full flex items-center gap-2.5"
        style={{ marginBottom: '4px' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-[0.06em]"
            style={{ color }}
          >
            {icon} {type}
          </span>
        </div>
        <span
          className="ml-auto text-xs flex-shrink-0"
          style={{ color: '#62666d', letterSpacing: '-0.01em' }}
        >
          {relativeTime(timestamp)}
        </span>
      </div>

      {/* Contenu — full width */}
      <p
        className="col-span-full text-sm"
        style={{
          color: '#d4d4d8',
          lineHeight: '1.7',
          letterSpacing: '-0.01em',
        }}
      >
        {compact && entry.text.length > 100
          ? entry.text.slice(0, 100) + '…'
          : entry.text}
      </p>

      {/* Grille métadonnées / info (2 colonnes) */}
      {showDetails && (
        <>
          {/* Métadonnées */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(39,39,42,0.3)',
              borderRadius: '10px',
            }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.08em]"
              style={{ color: '#62666d' }}
            >
              Type
            </span>
            <p
              className="text-sm mt-1"
              style={{ color: '#d4d4d8', letterSpacing: '-0.01em' }}
            >
              {icon} {type}
            </p>
            <span
              className="text-[10px] font-medium uppercase tracking-[0.08em] mt-3 block"
              style={{ color: '#62666d' }}
            >
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span
                className="text-[11px]"
                style={{
                  padding: '2px 10px',
                  borderRadius: '6px',
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                }}
              >
                {type}
              </span>
              {project && (
                <span
                  className="text-[11px]"
                  style={{
                    padding: '2px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#27272a',
                    color: '#a1a1aa',
                    border: '1px solid #3a3a3e',
                  }}
                >
                  {project}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(39,39,42,0.3)',
              borderRadius: '10px',
            }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.08em]"
              style={{ color: '#62666d' }}
            >
              Projet
            </span>
            <p
              className="text-sm mt-1"
              style={{ color: '#d4d4d8', letterSpacing: '-0.01em' }}
            >
              {project || '—'}
            </p>
            <span
              className="text-[10px] font-medium uppercase tracking-[0.08em] mt-3 block"
              style={{ color: '#62666d' }}
            >
              Date
            </span>
            <p
              className="text-sm mt-1"
              style={{ color: '#d4d4d8', letterSpacing: '-0.01em' }}
            >
              {relativeTime(timestamp)}
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
}
