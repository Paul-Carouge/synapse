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
      className={`bg-[#12121c] border border-[#1e1e2e]/60 rounded-2xl transition-all duration-200
        hover:bg-[#181825] hover:border-[#2a2a3e] ${compact ? 'p-4' : expanded ? 'p-5' : 'p-5'}`}
    >
      {/* Header: type badge + project tag + date */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color }}
          >
            {type}
          </span>
        </div>
        {project && (
          <span className="text-[9px] text-[#6b6b7a] px-2 py-0.5 rounded-md bg-[#1e1e2e] flex-shrink-0">
            {project}
          </span>
        )}
        <span className="ml-auto text-[10px] text-[#4a4a5a] flex-shrink-0 font-mono">
          {relativeTime(entry.metadata.timestamp || '')}
        </span>
      </div>

      {/* Content */}
      <p className={`text-[#c0c0d0] leading-relaxed ${compact || expanded ? 'text-sm' : 'text-sm'}`}>
        {compact && entry.text.length > 100
          ? entry.text.slice(0, 100) + '…'
          : entry.text}
      </p>
    </div>
  );
}
