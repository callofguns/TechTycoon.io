import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  value: number;
  onStep: (delta: number) => void;
  /** Coarse-to-fine increments shown on each side, e.g. [100, 10, 1]. */
  steps: number[];
  format: (value: number) => string;
}

/**
 * The shared big number control: -big/-mid/-small on the left, the current
 * value in the middle, +small/+mid/+big on the right. PriceStepper and
 * QuantityStepper are both thin wrappers around this.
 */
export function NumberStepper({ value, onStep, steps, format }: Props) {
  return (
    <div className="card-inset flex items-center justify-between gap-1 px-1.5 py-2">
      <div className="flex gap-1">
        {steps.map((step) => (
          <StepChip key={`down-${step}`} label={`-${step}`} onPress={() => onStep(-step)} />
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 460, damping: 28 }}
            className="tnum text-[22px] font-bold leading-none text-white"
          >
            {format(value)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-1">
        {[...steps].reverse().map((step) => (
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
