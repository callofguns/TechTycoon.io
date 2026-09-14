import { useState } from 'react';
import { BookOpen, FlaskConical, RotateCcw, Sparkles, Unlock } from 'lucide-react';
import { Screen, SectionTitle } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { money, count } from '../lib/format';
import { COMPONENTS } from '../game/components';
import { BALANCE } from '../game/economy';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import type { ComponentDef, ComponentId, ComponentTier } from '../types';

const HOW_TO_PLAY = [
  'Design a phone on the Design tab: pick parts, a look, a price, then how many to build.',
  'Manufacturing a batch plus tooling is paid upfront, so keep some cash spare.',
  `Each in-game day takes ${BALANCE.dayLengthMs / 1000} seconds at 1x. Use 2x or 3x to speed things up.`,
  'Phones sell better when quality is high for the price. Rivals are doing the same thing.',
  'News only happens on real dates from tech history — the game starts the day the first iPhone shipped.',
  'Once a batch sells out, that phone stops selling until you launch a new one.',
  'Research points trickle in every day — spend them with cash below to unlock better parts.',
];

const COMING_LATER = [
  'Laptops and desktop PCs',
  'Hiring staff and R&D',
  'Marketing campaigns',
  'Restocking a batch instead of launching a whole new phone',
];

export function MoreScreen() {
  const cash = useGameStore((s) => s.cash);
  const researchPoints = useGameStore((s) => s.researchPoints);
  const unlockedTierIndex = useGameStore((s) => s.unlockedTierIndex);
  const buyUnlock = useGameStore((s) => s.buyUnlock);
  const resetGame = useGameStore((s) => s.resetGame);
  const setTab = useGameStore((s) => s.setTab);
  const showToast = useToastStore((s) => s.show);
  const [confirmingReset, setConfirmingReset] = useState(false);

  // The one next tier each component could buy right now — you can't skip
  // ahead, so anything further out isn't shown until this one is bought.
  const nextUnlocks: { def: ComponentDef; tier: ComponentTier }[] = COMPONENTS.map((def) => {
    const nextIndex = (unlockedTierIndex[def.id] ?? 0) + 1;
    const tier = def.tiers[nextIndex];
    return tier ? { def, tier } : null;
  }).filter((entry): entry is { def: ComponentDef; tier: ComponentTier } => entry !== null);

  function handleBuy(componentId: ComponentId) {
    const result = buyUnlock(componentId);
    showToast(result.message);
  }

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

      <SectionTitle
        right={
          <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
            <FlaskConical size={12} strokeWidth={2.4} />
            {count(researchPoints)} research
          </span>
        }
      >
        Research & unlocks
      </SectionTitle>
      {nextUnlocks.length === 0 ? (
        <div className="card flex items-center gap-3 px-4 py-3.5">
          <Unlock size={16} className="shrink-0 text-emerald-400" />
          <p className="text-[12.5px] text-white/50">Every part is fully upgraded. Nice work.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {nextUnlocks.map(({ def, tier }) => {
            const cost = tier.unlockCost;
            const canAfford = !cost || (cash >= cost.cash && researchPoints >= cost.research);

            return (
              <div key={def.id} className="card px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-white">{tier.name}</div>
                    <div className="mt-0.5 text-[10.5px] text-white/35">
                      {def.label} · Q{tier.quality}
                    </div>
                  </div>

                  {cost && (
                    <div className="flex shrink-0 items-center gap-2.5 text-right">
                      <div>
                        <div
                          className={`tnum text-[12px] font-bold ${cash >= cost.cash ? 'text-white/80' : 'text-red-400'}`}
                        >
                          {money(cost.cash)}
                        </div>
                        <div
                          className={`tnum flex items-center justify-end gap-0.5 text-[10.5px] font-semibold ${
                            researchPoints >= cost.research ? 'text-cyan-400/70' : 'text-red-400/80'
                          }`}
                        >
                          <FlaskConical size={9} strokeWidth={2.6} />
                          {count(cost.research)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <PillButton
                  className="mt-2.5 !h-10 !text-[12.5px]"
                  disabled={!canAfford}
                  onClick={() => handleBuy(def.id)}
                >
                  <Unlock size={14} strokeWidth={2.4} />
                  Unlock
                </PillButton>
              </div>
            );
          })}
        </div>
      )}

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
