'use client';

import { motion } from 'framer-motion';

const tabs = [
  { id: 'filters', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', label: 'Filtres' },
  { id: 'search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', label: 'Recherche' },
  { id: 'stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Stats' },
];

export default function BottomSheetNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string | null;
  onTabChange: (tab: string | null) => void;
}) {
  return (
    <>
      {/* Spacer for mobile content — prevents content being hidden behind nav */}
      <div className="lg:hidden h-16" />

      {/* Fixed bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-[#0f1011]/95 border-t border-[#23252a]/60 backdrop-blur-sm">
          <div style={{ padding: '0 8px' }} className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom,0px)]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(isActive ? null : tab.id)}
                  className="relative flex flex-col items-center justify-center gap-0.5
                    w-16 h-full transition-all duration-200 active:scale-90 tap-highlight-transparent"
                  aria-label={tab.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-[#f59e0b]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-[#f59e0b]' : 'text-[#62666d]'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  <span className={`text-[9px] font-medium uppercase tracking-[0.06em] transition-colors duration-200 ${
                    isActive ? 'text-[#f59e0b]' : 'text-[#52525b]'
                  }`}>
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
