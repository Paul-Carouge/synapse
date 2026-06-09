'use client';

import { motion } from 'framer-motion';

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
        <div className="border-t border-[#1e1f22]/60" style={{ background: 'rgba(15,16,17,0.95)' }}>
          <div className="flex items-center justify-around h-14 pb-[env(safe-area-inset-bottom,0px)] px-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(isActive ? null : tab.id)}
                  className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full tap-highlight-transparent"
                  aria-label={tab.label}
                >
                  {isActive && (
                    <motion.div layoutId="nav-indicator" className="absolute -top-px w-6 h-0.5 rounded-full bg-[#f59e0b]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <svg className={`w-4 h-4 transition-colors ${isActive ? 'text-[#ededef]' : 'text-[#3a3a3e]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" d={tab.icon} />
                  </svg>
                  <span className={`text-[8px] font-medium uppercase tracking-[0.06em] transition-colors ${isActive ? 'text-[#ededef]' : 'text-[#3a3a3e]'}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
