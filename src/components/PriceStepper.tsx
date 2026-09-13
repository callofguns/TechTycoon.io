import { AnimatePresence, motion } from 'framer-motion';
import { money } from '../lib/format';

interface Props {
  price: number;
  onStep: (delta: number) => void;
}

/** Steps available either side of the price: −100/−10/−1 and +1/+10/+100. */
const STEPS = [100, 10, 1];

/** The big price control: coarse and fine adjust buttons around the number. */
export function PriceStepper({ price, onStep }: Props) {
  return (
    <div className="card-inset flex items-center justify-between gap-1 px-1.5 py-2">
      <div className="flex gap-1">
        {STEPS.map((step) => (
          <StepChip key={`down-${step}`} label={`-${step}`} onPress={() => onStep(-step)} />
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={price}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 460, damping: 28 }}
            className="tnum text-[22px] font-bold leading-none text-white"
          >
            {money(price)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-1">
        {[...STEPS].reverse().map((step) => (
          <StepChip key={`up-${step}`} label={`+${step}`} onPress={() => onStep(step)} />
        ))}
      </div>
    </div>
  );
}

function StepChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="tnum flex h-10 w-[34px] items-center justify-center rounded-xl border border-white/[0.07] bg-ink-700 text-[11px] font-bold text-white/65 active:bg-ink-500"
    >
      {label}
    </motion.button>
  );
}
