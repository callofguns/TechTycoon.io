import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';
import { money } from '../lib/format';
import { computeQuality, computeUnitCost, toolingCost } from '../game/economy';
import type { PartSelection } from '../types';

/**
 * Running totals for the phone being designed: overall quality, what one unit
 * costs to build, and the one-off tooling bill to start production.
 */
export function DesignSummary({ parts }: { parts: PartSelection }) {
  const quality = computeQuality(parts);
  const unitCost = computeUnitCost(parts);
  const tooling = toolingCost(unitCost);

  return (
    <div className="card px-4 py-3.5">
      <div className="flex items-end justify-between">
        <div>
          <div className="label-dim">Overall quality</div>
          <AnimatedNumber
            value={quality}
            format={(v) => String(Math.round(v))}
            className="tnum mt-1 block text-[26px] font-bold leading-none text-white"
          />
        </div>
        <div className="text-right">
          <div className="label-dim">Build cost / unit</div>
          <AnimatedNumber
            value={unitCost}
            format={money}
            className="tnum mt-1 block text-[18px] font-bold leading-none text-white/85"
          />
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-white/[0.07]">
        <motion.div
          className="h-full rounded-pill bg-accent"
          initial={false}
          animate={{ width: `${quality}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11.5px]">
        <span className="text-white/35">One-off tooling cost</span>
        <span className="tnum font-semibold text-white/70">{money(tooling)}</span>
      </div>
    </div>
  );
}
