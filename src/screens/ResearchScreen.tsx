import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, Clock, FlaskConical, Lock, Unlock } from 'lucide-react';
import { Screen } from '../components/Screen';
import { PillButton } from '../components/PillButton';
import { money, count, formatDate } from '../lib/format';
import { COMPONENTS, isTierDateReady } from '../game/components';
import { COMPONENT_COLORS, COMPONENT_ICONS } from '../lib/componentColors';
import { dateForDay, parseISODate } from '../game/calendar';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';
import type { ComponentDef, ComponentId, ComponentTier } from '../types';

interface Props {
  onBack: () => void;
}

interface CategoryInfo {
  def: ComponentDef;
  /** The next tier this component could buy, or null if fully upgraded. */
  tier: ComponentTier | null;
  /** The level you'd be buying up to — 1-indexed, so it starts at "Level 1". */
  nextLevel: number;
  dateReady: boolean;
}

/**
 * Dedicated research menu, styled after the reference apps: a horizontal
 * strip of part categories up top, the selected category's next upgrade
 * below, and one shared cash/research total with a single confirm button
 * at the bottom rather than a buy button per card.
 */
export function ResearchScreen({ onBack }: Props) {
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const researchPoints = useGameStore((s) => s.researchPoints);
  const unlockedTierIndex = useGameStore((s) => s.unlockedTierIndex);
  const buyUnlock = useGameStore((s) => s.buyUnlock);
  const showToast = useToastStore((s) => s.show);

  const currentDate = dateForDay(day);

  const categories: CategoryInfo[] = COMPONENTS.map((def) => {
    const nextIndex = (unlockedTierIndex[def.id] ?? 0) + 1;
    const tier = def.tiers[nextIndex] ?? null;
    return {
      def,
      tier,
      nextLevel: nextIndex + 1, // tier index is 0-based; shown level starts at 1
      dateReady: tier ? isTierDateReady(tier, currentDate) : true,
    };
  });

  // Land on the first category that still has something to research.
  const [selected, setSelected] = useState<ComponentId>(
    () => categories.find((c) => c.tier)?.def.id ?? COMPONENTS[0].id,
  );

  const active = categories.find((c) => c.def.id === selected) ?? categories[0];
  const { def, tier, nextLevel, dateReady } = active;
  const colors = COMPONENT_COLORS[def.id];
  const cost = tier?.unlockCost ?? null;
  const canAfford = !cost || (cash >= cost.cash && researchPoints >= cost.research);
  const canBuy = !!tier && dateReady && canAfford;

  function handleResearch() {
    const result = buyUnlock(selected);
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
      </div>

      <div className="px-0.5">
        <h1 className="text-[22px] font-bold leading-tight text-white">Research</h1>
        <p className="mt-1 text-[12.5px] leading-snug text-white/40">
          Pick a category, then spend cash and research together to buy its next upgrade.
        </p>
      </div>

      {/* Category strip */}
      <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {categories.map(({ def: catDef, tier: catTier, dateReady: catDateReady }) => {
          const Icon = COMPONENT_ICONS[catDef.id];
          const catColors = COMPONENT_COLORS[catDef.id];
          const isSelected = catDef.id === selected;
          const maxed = !catTier;
          const locked = !maxed && !catDateReady;

          return (
            <motion.button
              key={catDef.id}
              type="button"
              onClick={() => setSelected(catDef.id)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              className={`relative flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors ${
                isSelected ? `${catColors.border} ${catColors.softBg}` : 'border-white/[0.07] bg-ink-700'
              }`}
            >
              <Icon
                size={19}
                strokeWidth={2.2}
                className={isSelected ? catColors.text : maxed ? 'text-emerald-400/60' : 'text-white/45'}
              />
              {maxed && (
                <CheckCircle2
                  size={13}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-ink-800 text-emerald-400"
                />
              )}
              {locked && (
                <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink-800">
                  <Lock size={9} strokeWidth={2.6} className="text-amber-300" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected category */}
      {!tier ? (
        <div className="card flex items-center gap-3 px-4 py-3.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.softBg} ${colors.text}`}>
            <Unlock size={16} />
          </div>
          <p className="text-[12.5px] text-white/50">{def.label} is already fully upgraded.</p>
        </div>
      ) : (
        <motion.div
          key={def.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="card px-4 py-3.5"
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.softBg} ${colors.text}`}>
              {(() => {
                const Icon = COMPONENT_ICONS[def.id];
                return <Icon size={17} strokeWidth={2.3} />;
              })()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold text-white">
                {def.label} · Level {nextLevel}
              </div>
              <div className="mt-0.5 text-[11px] text-white/35">
                {tier.name} · Q{tier.quality}
              </div>
            </div>
          </div>

          {!dateReady && tier.availableFrom && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300">
              <Clock size={12} strokeWidth={2.4} />
              Not invented yet — arrives {formatDate(parseISODate(tier.availableFrom))}
            </div>
          )}
        </motion.div>
      )}

      {/* Shared totals + confirm */}
      <div className="card flex items-center gap-3 px-4 py-3.5">
        <div className="flex flex-1 gap-4">
          <div>
            <div className="label-dim">Cash</div>
            <div className={`tnum mt-1 text-[15px] font-bold ${cost && cash < cost.cash ? 'text-red-400' : 'text-white'}`}>
              {money(cash)}
            </div>
          </div>
          <div>
            <div className="label-dim">Research</div>
            <div
              className={`tnum mt-1 flex items-center gap-1 text-[15px] font-bold ${
                cost && researchPoints < cost.research ? 'text-red-400' : 'text-cyan-400'
              }`}
            >
              <FlaskConical size={13} strokeWidth={2.6} />
              {count(researchPoints)}
            </div>
          </div>
        </div>

        <PillButton
          className="!h-12 !w-auto shrink-0 px-6"
          disabled={!canBuy}
          onClick={handleResearch}
        >
          <FlaskConical size={16} strokeWidth={2.4} />
          Research
        </PillButton>
      </div>

      {tier && cost && (
        <p className="px-1 text-center text-[11px] text-white/30">
          Costs {money(cost.cash)} and {count(cost.research)} research
        </p>
      )}
    </Screen>
  );
}
