import { Rocket } from 'lucide-react';
import { UnitsSlider } from '../../components/UnitsSlider';
import { PillButton } from '../../components/PillButton';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { SectionTitle } from '../../components/Screen';
import { money } from '../../lib/format';
import { BALANCE, computeQuality, computeUnitCost, profitPerUnit, toolingCost } from '../../game/economy';
import { activeModifiers } from '../../game/news';
import { useGameStore } from '../../store/gameStore';

interface Props {
  onLaunch: () => void;
}

/**
 * Stage 4: decide how big a first batch to build, then launch.
 * Manufacturing the whole batch is paid upfront (plus one-off tooling) —
 * selling units afterwards is then pure revenue, since they're already paid for.
 */
export function ProductionStage({ onLaunch }: Props) {
  const draft = useGameStore((s) => s.draft);
  const cash = useGameStore((s) => s.cash);
  const news = useGameStore((s) => s.news);
  const setDraftUnits = useGameStore((s) => s.setDraftUnits);

  const quality = computeQuality(draft.parts);
  const unitCost = computeUnitCost(draft.parts);
  const tooling = toolingCost(unitCost);
  const { costMult } = activeModifiers(news);
  const marginPerUnit = profitPerUnit(draft.price, unitCost, costMult);

  const manufacturingCost = Math.round(unitCost * costMult * draft.unitsToManufacture);
  const totalUpfront = tooling + manufacturingCost;
  const projectedProfit = marginPerUnit * draft.unitsToManufacture - tooling;
  const canAfford = cash >= totalUpfront;

  // However many units you can actually afford right now — the slider's
  // range grows and shrinks with your cash instead of stopping at a fixed cap.
  const affordableUnits = Math.max(
    BALANCE.minBatchSize,
    Math.floor((cash - tooling) / (unitCost * costMult || 1)),
  );

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Units to manufacture</SectionTitle>
      <div className="card px-4 py-4">
        <UnitsSlider value={draft.unitsToManufacture} min={BALANCE.minBatchSize} max={affordableUnits} onChange={setDraftUnits} />
        <p className="mt-3 px-0.5 text-[11.5px] leading-snug text-white/40">
          This is your starting inventory. Once every unit is sold, {draft.name.trim() || 'this phone'}{' '}
          stops selling until you launch a new one.
        </p>
      </div>

      <SectionTitle>What it costs to start</SectionTitle>
      <div className="card px-4 py-3">
        <Row label="Manufacturing" value={money(manufacturingCost)} />
        <Row label="Tooling (one-off)" value={money(tooling)} />
        <Row label="Total to pay now" value={money(totalUpfront)} tone={canAfford ? 'neutral' : 'bad'} />
      </div>

      <div className="card-inset px-3.5 py-3">
        <div className="label-dim">Potential profit if it all sells</div>
        <AnimatedNumber
          value={projectedProfit}
          format={money}
          className={`tnum mt-1 block text-[22px] font-bold leading-none ${
            projectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        />
        <div className="mt-0.5 text-[11px] text-white/35">Quality Q{quality} at {money(draft.price)} each</div>
      </div>

      <PillButton onClick={onLaunch} disabled={!canAfford || draft.name.trim().length === 0}>
        <Rocket size={17} strokeWidth={2.4} />
        {canAfford ? 'Launch phone' : `Need ${money(totalUpfront - cash)} more`}
      </PillButton>
    </div>
  );
}

function Row({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'bad';
}) {
  return (
    <div className="flex items-center justify-between py-1 text-[12.5px]">
      <span className="text-white/40">{label}</span>
      <span
        className={`tnum truncate pl-3 font-semibold ${tone === 'bad' ? 'text-red-400' : 'text-white/85'}`}
      >
        {value}
      </span>
    </div>
  );
}
