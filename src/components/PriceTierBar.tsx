import { motion } from 'framer-motion';
import { PRICE_TIERS, priceTierOf } from '../game/economy';
import type { PriceTierId } from '../game/economy';

interface Props {
  /** Market share percentage per bracket, from `priceTierShares`. */
  shares: Record<PriceTierId, number>;
  /** The price the player is currently considering, used to highlight a segment. */
  currentPrice: number;
}

/**
 * Three-segment bar showing how the market splits between Budget, Mid-range
 * and Premium phones. The segment your price lands in is highlighted.
 */
export function PriceTierBar({ shares, currentPrice }: Props) {
  const activeTier = priceTierOf(currentPrice);

  return (
    <div>
      <div className="flex h-9 w-full gap-1 overflow-hidden rounded-2xl">
        {PRICE_TIERS.map((tier) => {
          const isActive = tier.id === activeTier;
          const share = shares[tier.id];

          return (
            <motion.div
              key={tier.id}
              layout
              animate={{ flexGrow: Math.max(share, 8) }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className={`flex min-w-0 items-center justify-center rounded-lg ${
                isActive ? 'bg-accent' : 'bg-white/[0.07]'
              }`}
            >
              <span
                className={`tnum text-[12px] font-bold ${isActive ? 'text-white' : 'text-white/45'}`}
              >
                {share}%
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between px-0.5">
        {PRICE_TIERS.map((tier) => {
          const isActive = tier.id === activeTier;
          const range =
            tier.max === Infinity
              ? `$900+`
              : tier.id === 'budget'
                ? `< $${tier.max}`
                : `$400-899`;

          return (
            <div key={tier.id} className="text-center">
              <div
                className={`text-[11px] font-semibold ${isActive ? 'text-accent-soft' : 'text-white/40'}`}
              >
                {tier.label}
              </div>
              <div className="text-[10px] text-white/25">{range}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
