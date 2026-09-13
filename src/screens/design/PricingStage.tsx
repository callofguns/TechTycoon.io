import { Rocket } from 'lucide-react';
import { PriceTierBar } from '../../components/PriceTierBar';
import { PriceStepper } from '../../components/PriceStepper';
import { PillButton } from '../../components/PillButton';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { SectionTitle } from '../../components/Screen';
import { money } from '../../lib/format';
import {
  computeQuality,
  computeUnitCost,
  fairPrice,
  noveltyFactor,
  priceTierShares,
  profitPerUnit,
  toolingCost,
  valueScore,
} from '../../game/economy';
import { activeModifiers } from '../../game/news';
import { selectRivalProducts, useGameStore } from '../../store/gameStore';

interface Props {
  onLaunch: () => void;
}

/** Stage 3: see where the market sits, set a price, and launch. */
export function PricingStage({ onLaunch }: Props) {
  const draft = useGameStore((s) => s.draft);
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const news = useGameStore((s) => s.news);
  const products = useGameStore((s) => s.products);
  const rivalProducts = useGameStore(selectRivalProducts);
  const stepDraftPrice = useGameStore((s) => s.stepDraftPrice);

  const quality = computeQuality(draft.parts);
  const unitCost = computeUnitCost(draft.parts);
  const tooling = toolingCost(unitCost);
  const { costMult } = activeModifiers(news);
  const margin = profitPerUnit(draft.price, unitCost, costMult);

  const shares = priceTierShares(products, day);
  const canAfford = cash >= tooling;

  // How our phone stacks up against the best thing already on sale.
  const myScore = valueScore(quality, draft.price) * noveltyFactor(0);
  const bestRivalScore = rivalProducts.reduce(
    (best, p) => Math.max(best, valueScore(p.quality, p.price) * noveltyFactor(day - p.launchedOnDay)),
    0,
  );
  const verdict =
    bestRivalScore === 0
      ? 'You have the market to yourself.'
      : myScore > bestRivalScore * 1.25
        ? 'Great value — this should undercut the competition.'
        : myScore > bestRivalScore * 0.9
          ? 'Competitive with the phones already on sale.'
          : 'Weak value right now. Cut the price or improve the parts.';

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Market by price bracket</SectionTitle>
      <div className="card px-4 py-3.5">
        <PriceTierBar shares={shares} currentPrice={draft.price} />

        <p className="mt-3 border-t border-white/[0.06] pt-2.5 text-[11.5px] leading-snug text-white/40">
          {rivalProducts.length === 0
            ? 'No rival phones are on sale.'
            : rivalProducts
                .map((p) => `${p.name} sells at ${money(p.price)} (Q${p.quality})`)
                .join(' · ')}
        </p>
      </div>

      <SectionTitle>Your price</SectionTitle>
      <div className="card px-3 py-3">
        <PriceStepper price={draft.price} onStep={stepDraftPrice} />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Readout
            label="Profit per unit"
            value={margin}
            tone={margin > 0 ? 'good' : 'bad'}
          />
          <Readout label="Buyers expect" value={fairPrice(quality)} />
        </div>

        <p className="mt-2.5 px-0.5 text-[11.5px] leading-snug text-white/40">{verdict}</p>
      </div>

      <div className="card px-4 py-3">
        <Row label="Phone" value={draft.name.trim() || 'Unnamed'} />
        <Row label="Quality" value={`Q${quality}`} />
        <Row label="Build cost" value={`${money(unitCost)} / unit`} />
        <Row label="Tooling (one-off)" value={money(tooling)} tone={canAfford ? 'neutral' : 'bad'} />
      </div>

      <PillButton onClick={onLaunch} disabled={!canAfford || draft.name.trim().length === 0}>
        <Rocket size={17} strokeWidth={2.4} />
        {canAfford ? 'Launch phone' : `Need ${money(tooling - cash)} more`}
      </PillButton>
    </div>
  );
}

function Readout({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'good' | 'bad';
}) {
  const color = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="card-inset px-3 py-2.5">
      <div className="label-dim truncate">{label}</div>
      <AnimatedNumber
        value={value}
        format={money}
        className={`tnum mt-1 block text-[16px] font-bold leading-none ${color}`}
      />
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
