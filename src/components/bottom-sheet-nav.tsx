'use client';

import { motion } from 'framer-motion';
import { tokens } from '@/lib/tokens';

const tabs = [
  { id: 'filters', label: 'Filtres', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { id: 'search', label: 'Recherche', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'stats', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function BottomSheetNav({ activeTab, onTabChange }: { activeTab: string | null; onTabChange: (tab: string | null) => void }) {
  return (
    <>
      <div className="lg:hidden h-14" />
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div
          style={{
            background: tokens.surface,
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <div className="flex items-center justify-around h-14 pb-[env(safe-area-inset-bottom,0px)] px-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(isActive ? null : tab.id)}
                  className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full tap-highlight-transparent"
                  aria-label={tab.label}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: '24px',
                        height: '2px',
                        borderRadius: `${tokens.radius.sm}px`,
                        backgroundColor: tokens.accent,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <svg
                    style={{
                      width: '16px',
                      height: '16px',
                      transition: 'color 0.15s',
                      color: isActive ? tokens.textPrimary : tokens.textTertiary,
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" d={tab.icon} />
                  </svg>
                  <span
                    style={{
                      fontSize: `${tokens.caption}px`,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      transition: 'color 0.15s',
                      color: isActive ? tokens.textPrimary : tokens.textTertiary,
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
