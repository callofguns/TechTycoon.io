import { motion } from 'framer-motion';
import { ChevronLeft, Clock, FlaskConical, Unlock } from 'lucide-react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { money, count, formatDate } from '../lib/format';
import { COMPONENTS, isTierDateReady } from '../game/components';
import { dateForDay, parseISODate } from '../game/calendar';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import type { ComponentDef, ComponentId, ComponentTier } from '../types';

interface Props {
  onBack: () => void;
}

/**
 * Dedicated research menu — spend cash + research points together to unlock
 * the next tier of each part, once it's actually old enough to exist.
 * Reached from a card on the More tab rather than its own bottom-nav tab.
 */
export function ResearchScreen({ onBack }: Props) {
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const researchPoints = useGameStore((s) => s.researchPoints);
  const unlockedTierIndex = useGameStore((s) => s.unlockedTierIndex);
  const buyUnlock = useGameStore((s) => s.buyUnlock);
  const showToast = useToastStore((s) => s.show);

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
      <div className="flex items-center justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className="-ml-1.5 flex h-9 items-center gap-0.5 rounded-pill pl-1 pr-3 text-[13px] font-semibold text-white/70 active:bg-white/5"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
          More
        </motion.button>
        <span className="flex items-center gap-1 text-[12px] font-semibold text-cyan-400">
          <FlaskConical size={13} strokeWidth={2.4} />
          {count(researchPoints)} research
        </span>
      </div>

      <div className="px-0.5">
        <h1 className="text-[22px] font-bold leading-tight text-white">Research</h1>
        <p className="mt-1 text-[12.5px] leading-snug text-white/40">
          Cash and research points, spent together, buy the next tier of a part — once that tech has
          actually been invented on your game's timeline.
        </p>
      </div>

      {nextUnlocks.length === 0 ? (
        <div className="card flex items-center gap-3 px-4 py-3.5">
          <Unlock size={16} className="shrink-0 text-emerald-400" />
          <p className="text-[12.5px] text-white/50">Every part is fully upgraded. Nice work.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {nextUnlocks.map(({ def, tier }) => {
            const cost = tier.unlockCost;
            const dateReady = isTierDateReady(tier, dateForDay(day));
            const canAfford = !cost || (cash >= cost.cash && researchPoints >= cost.research);
            const canBuy = dateReady && canAfford;

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
                    <div
                      className={`flex shrink-0 items-center gap-2.5 text-right ${dateReady ? '' : 'opacity-40'}`}
                    >
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

                {!dateReady && tier.availableFrom && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300">
                    <Clock size={12} strokeWidth={2.4} />
                    Not invented yet — arrives {formatDate(parseISODate(tier.availableFrom))}
                  </div>
                )}

                <PillButton
                  className="mt-2.5 !h-10 !text-[12.5px]"
                  disabled={!canBuy}
                  onClick={() => handleBuy(def.id)}
                >
                  <Unlock size={14} strokeWidth={2.4} />
                  {dateReady ? 'Unlock' : 'Not available yet'}
                </PillButton>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
