import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, RotateCcw, Sparkles, Unlock } from 'lucide-react';
import { Screen, SectionTitle } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { money } from '../lib/format';
import { COMPONENTS } from '../game/components';
import { BALANCE } from '../game/economy';
import { DAY_LENGTH_MS } from '../hooks/useGameClock';
import { useGameStore } from '../store/gameStore';

const HOW_TO_PLAY = [
  'Design a phone on the Design tab: pick parts, name it, then set a price.',
  'Launching costs a one-off tooling fee, so keep some cash spare.',
  `Each in-game day takes ${DAY_LENGTH_MS / 1000} seconds at 1x. Use 2x or 3x to speed things up.`,
  'Phones sell better when quality is high for the price. Rivals are doing the same thing.',
  'Phones lose appeal as they age — replace them with newer models over time.',
];

const COMING_LATER = [
  'Laptops and desktop PCs',
  'Hiring staff and R&D',
  'Marketing campaigns',
  'Factories and production limits',
];

export function MoreScreen() {
  const lifetimeRevenue = useGameStore((s) => s.lifetimeRevenue);
  const resetGame = useGameStore((s) => s.resetGame);
  const setTab = useGameStore((s) => s.setTab);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Every locked tier across all components, nearest unlock first.
  const upcoming = COMPONENTS.flatMap((def) =>
    def.tiers.map((tier) => ({ def, tier })).filter((entry) => entry.tier.unlockRevenue > 0),
  ).sort((a, b) => a.tier.unlockRevenue - b.tier.unlockRevenue);

  return (
    <Screen>
      <SectionTitle>How to play</SectionTitle>
      <div className="card px-4 py-3.5">
        <div className="flex items-center gap-2 pb-2">
          <BookOpen size={15} className="text-accent" />
          <span className="text-[13px] font-semibold text-white">The basics</span>
        </div>
        <ol className="flex flex-col gap-2 border-t border-white/[0.06] pt-2.5">
          {HOW_TO_PLAY.map((line, index) => (
            <li key={line} className="flex gap-2.5">
              <span className="tnum mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-bold text-white/50">
                {index + 1}
              </span>
              <span className="text-[12.5px] leading-snug text-white/55">{line}</span>
            </li>
          ))}
        </ol>
      </div>

      <SectionTitle>Part unlocks</SectionTitle>
      <div className="card px-4 py-2">
        {upcoming.map(({ def, tier }) => {
          const unlocked = lifetimeRevenue >= tier.unlockRevenue;
          const progress = Math.min(100, (lifetimeRevenue / tier.unlockRevenue) * 100);

          return (
            <div key={`${def.id}-${tier.name}`} className="border-b border-white/[0.05] py-2.5 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {unlocked ? (
                    <Unlock size={13} className="shrink-0 text-accent" />
                  ) : (
                    <Lock size={13} className="shrink-0 text-white/25" />
                  )}
                  <span
                    className={`truncate text-[12.5px] font-semibold ${
                      unlocked ? 'text-white/85' : 'text-white/40'
                    }`}
                  >
                    {tier.name}
                  </span>
                  <span className="shrink-0 text-[10.5px] text-white/25">{def.label}</span>
                </div>
                <span className="tnum shrink-0 text-[11px] font-semibold text-white/45">
                  {money(tier.unlockRevenue)}
                </span>
              </div>

              {!unlocked && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-pill bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-pill bg-accent/60"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionTitle>Coming later</SectionTitle>
      <div className="card px-4 py-3">
        {COMING_LATER.map((item) => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <Sparkles size={13} className="shrink-0 text-white/20" />
            <span className="text-[12.5px] text-white/35">{item}</span>
            <span className="ml-auto rounded-pill bg-white/[0.05] px-2 py-0.5 text-[9.5px] font-bold text-white/30">
              SOON
            </span>
          </div>
        ))}
      </div>

      <SectionTitle>Save</SectionTitle>
      <div className="card flex flex-col gap-2.5 px-4 py-3.5">
        <p className="text-[12px] leading-snug text-white/40">
          Your company is saved automatically in this browser. Resetting starts a brand new company
          with {money(BALANCE.startingCash)} and cannot be undone.
        </p>
        <PillButton
          variant={confirmingReset ? 'primary' : 'ghost'}
          onClick={() => {
            if (!confirmingReset) {
              setConfirmingReset(true);
              window.setTimeout(() => setConfirmingReset(false), 4000);
              return;
            }
            resetGame();
            setConfirmingReset(false);
            setTab('home');
          }}
        >
          <RotateCcw size={16} strokeWidth={2.4} />
          {confirmingReset ? 'Tap again to confirm reset' : 'Reset game'}
        </PillButton>
      </div>
    </Screen>
  );
}
