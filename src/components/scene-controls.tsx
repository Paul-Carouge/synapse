'use client';

import { motion } from 'framer-motion';
import { spring, buttonTap } from '@/lib/motion';

export default function SceneControls({
  showEdges,
  autoRotate,
  onToggleEdges,
  onToggleAutoRotate,
  onResetCamera,
  onTimelineChange,
  hasTimelineFilter,
}: {
  showEdges: boolean;
  autoRotate: boolean;
  onToggleEdges: () => void;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  onTimelineChange: (range: { start: number; end: number } | null) => void;
  hasTimelineFilter: boolean;
}) {
  return (
    <div className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-10 items-center gap-1">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.3 }}
        className="flex items-center gap-0.5"
        style={{
          padding: '3px',
          borderRadius: '10px',
          backgroundColor: 'rgba(15,16,17,0.92)',
          border: '1px solid rgba(30,31,34,0.8)',
        }}
      >
        <CtrlBtn active={hasTimelineFilter} onClick={() => onTimelineChange(hasTimelineFilter ? null : { start: 0, end: Date.now() })} tooltip="Timeline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </CtrlBtn>
        <div className="w-px h-3.5 bg-[#1e1f22]" />
        <CtrlBtn active={showEdges} onClick={onToggleEdges} tooltip={showEdges ? 'Masquer liens' : 'Afficher liens'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
        </CtrlBtn>
        <CtrlBtn active={autoRotate} onClick={onToggleAutoRotate} tooltip={autoRotate ? 'Arrêter rotation' : 'Rotation auto'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </CtrlBtn>
        <CtrlBtn active={false} onClick={onResetCamera} tooltip="Réinitialiser caméra">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </CtrlBtn>
      </motion.div>
    </div>
  );
}

function CtrlBtn({ children, active, onClick, tooltip }: { children: React.ReactNode; active: boolean; onClick: () => void; tooltip: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={buttonTap}
      className="relative group flex items-center justify-center"
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '7px',
        color: active ? '#ededef' : '#52525b',
        transition: 'color 0.15s',
      }}
      aria-label={tooltip}
    >
      {children}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <div style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', color: '#8a8f98', background: 'rgba(15,16,17,0.95)', border: '1px solid rgba(30,31,34,0.8)' }}>
          {tooltip}
        </div>
      </div>
    </motion.button>
  );
}
