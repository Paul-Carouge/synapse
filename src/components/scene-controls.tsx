'use client';

import { motion } from 'framer-motion';
import { spring, buttonTap } from '@/lib/motion';

interface SceneControlsProps {
  showEdges: boolean;
  autoRotate: boolean;
  onToggleEdges: () => void;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  onTimelineChange: (range: { start: number; end: number } | null) => void;
  hasTimelineFilter: boolean;
}

export default function SceneControls({
  showEdges,
  autoRotate,
  onToggleEdges,
  onToggleAutoRotate,
  onResetCamera,
  onTimelineChange,
  hasTimelineFilter,
}: SceneControlsProps) {
  return (
    <div className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-10 items-center gap-1.5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.4 }}
        className="flex items-center gap-1"
        style={{
          padding: '4px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15,16,17,0.85)',
          border: '1px solid rgba(35,37,42,0.6)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <ControlButton
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
              <path d="M3 12h18" />
              <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" />
            </svg>
          }
          active={hasTimelineFilter}
          onClick={() => onTimelineChange(hasTimelineFilter ? null : { start: 0, end: Date.now() })}
          tooltip="Timeline"
        />
        <div className="w-px h-4 bg-[#23252a]" />
        <ControlButton
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
          active={showEdges}
          onClick={onToggleEdges}
          tooltip={showEdges ? 'Masquer liens' : 'Afficher liens'}
        />
        <ControlButton
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          }
          active={autoRotate}
          onClick={onToggleAutoRotate}
          tooltip={autoRotate ? 'Arrêter rotation' : 'Rotation auto'}
        />
        <ControlButton
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          }
          active={false}
          onClick={onResetCamera}
          tooltip="Réinitialiser caméra"
        />
        <div className="w-px h-4 bg-[#23252a]" />
        <ControlButton
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <path d="M20.2 20.2a10 10 0 0 0 0-14.4" />
              <path d="M17.1 17.1a6 6 0 0 0 0-8.2" />
            </svg>
          }
          active={false}
          onClick={() => {}}
          tooltip={`${0} nœuds visibles`}
          noToggle
        />
      </motion.div>
    </div>
  );
}

function ControlButton({
  icon,
  active,
  onClick,
  tooltip,
  noToggle,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tooltip: string;
  noToggle?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={buttonTap}
      className="relative group flex items-center justify-center"
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        backgroundColor: active ? 'rgba(245,158,11,0.12)' : 'transparent',
        color: active ? '#f59e0b' : '#62666d',
        transition: 'background-color 0.2s, color 0.2s',
      }}
      aria-label={tooltip}
    >
      {icon}
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <div style={{ padding: '3px 8px' }} className="bg-[#161718] border border-[#23252a] rounded-md text-[10px] text-[#a1a1aa]">
          {tooltip}
        </div>
      </div>
    </motion.button>
  );
}
