import { motion } from 'framer-motion';
import { Home, Cpu, Store, Wallet, MoreHorizontal } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { TabId } from '../types';

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'design', label: 'Design', icon: Cpu },
  { id: 'market', label: 'Market', icon: Store },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

/** Bottom tab bar: icon above a label, with a springy highlight on the active tab. */
export function BottomNav() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setTab = useGameStore((s) => s.setTab);

  return (
    <nav className="shrink-0 border-t border-white/[0.07] bg-ink-800/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="flex items-stretch justify-between px-2 pt-1.5 pb-1.5">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              className="relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-highlight"
                  className="absolute inset-x-1 inset-y-0 rounded-2xl bg-accent/10"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={2.2}
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-accent' : 'text-white/40'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-accent' : 'text-white/40'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
