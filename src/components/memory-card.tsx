import { getTypeColor } from '@/lib/memory-data';
import { relativeTime } from '@/lib/time';
import type { MemoryEntry } from '@/lib/memory-data';

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
  const project = entry.metadata.project;

  return (
    <div
      className={`bg-[#161718] border border-[#23252a]/60 rounded-xl transition-all duration-200
        hover:bg-[#1a1a1e] hover:border-[#2a2a2e] ${compact ? 'p-4' : 'p-5'}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-[0.06em]"
            style={{ color }}
          >
            {type}
          </span>
        </div>
        {project && (
          <span className="text-[11px] text-[#8a8f98] px-2 py-0.5 rounded-md bg-[#23252a] flex-shrink-0">
            {project}
          </span>
        )}
        <span className="ml-auto text-xs text-[#62666d] flex-shrink-0">
          {relativeTime(entry.metadata.timestamp || '')}
        </span>
      </div>

      {/* Content */}
      <p className={`text-[#a1a1aa] leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
        {compact && entry.text.length > 100
          ? entry.text.slice(0, 100) + '…'
          : entry.text}
      </p>
    </div>
  );
}
