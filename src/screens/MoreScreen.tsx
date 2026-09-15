import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, FlaskConical, RotateCcw, Sparkles } from 'lucide-react';
import { Screen, SectionTitle } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { ResearchScreen } from './ResearchScreen';
import { money, count } from '../lib/format';
import { COMPONENTS, isTierDateReady } from '../game/components';
import { BALANCE } from '../game/economy';
import { dateForDay } from '../game/calendar';
import { useGameStore } from '../store/gameStore';

const HOW_TO_PLAY = [
  'Design a phone on the Design tab: pick parts, a look, a price, then how many to build.',
  'Manufacturing a batch plus tooling is paid upfront, so keep some cash spare.',
  `Each in-game day takes ${BALANCE.dayLengthMs / 1000} seconds at 1x. Use 2x or 3x to speed things up.`,
  'Phones sell better when quality is high for the price. Rivals are doing the same thing.',
  'News only happens on real dates from tech history — the game starts the day the first iPhone shipped.',
  'Once a batch sells out, that phone stops selling until you launch a new one.',
  "Research points trickle in every day — spend them with cash in the Research menu to unlock better parts, once that tech has actually been invented on your game's timeline.",
];

const COMING_LATER = [
  'Laptops and desktop PCs',
  'Hiring staff and R&D',
  'Marketing campaigns',
  'Restocking a batch instead of launching a whole new phone',
];

type View = 'main' | 'research';

export function MoreScreen() {
  const [view, setView] = useState<View>('main');
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const researchPoints = useGameStore((s) => s.researchPoints);
  const unlockedTierIndex = useGameStore((s) => s.unlockedTierIndex);
  const resetGame = useGameStore((s) => s.resetGame);
  const setTab = useGameStore((s) => s.setTab);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (view === 'research') {
    return <ResearchScreen onBack={() => setView('main')} />;
  }

  // How many parts could be bought right this moment — cash, research, and
  // the calendar all lined up — so the entry card can hint at it.
  const readyToBuyCount = COMPONENTS.filter((def) => {
    const nextIndex = (unlockedTierIndex[def.id] ?? 0) + 1;
    const tier = def.tiers[nextIndex];
    if (!tier) return false;
    const cost = tier.unlockCost;
    const dateReady = isTierDateReady(tier, dateForDay(day));
    const canAfford = !cost || (cash >= cost.cash && researchPoints >= cost.research);
    return dateReady && canAfford;
  }).length;

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

      <SectionTitle>Research</SectionTitle>
      <motion.button
        type="button"
        onClick={() => setView('research')}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
        className="card flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
          <FlaskConical size={19} />
          {readyToBuyCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-ink-900">
              {readyToBuyCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold text-white">Unlock better parts</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-white/40">
            <FlaskConical size={11} strokeWidth={2.4} className="text-cyan-400/70" />
            {count(researchPoints)} research points saved up
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={2.4} className="shrink-0 text-white/25" />
      </motion.button>

      <SectionTitle>Coming later</SectionTitle>
      <div className="card px-4 py-3">
        {COMING_LATER.map((item) => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <Sparkles size={13} className="shrink-0 text-violet-400/50" />
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
          variant={confirmingReset ? 'danger' : 'ghost'}
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
