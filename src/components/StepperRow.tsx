import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { QualityBar } from './QualityBar';

interface Props {
  label: string;
  blurb?: string;
  /** Main text inside the pill, e.g. the tier name. */
  value: string;
  /** Small second line inside the pill, e.g. the part cost. */
  subValue?: string;
  /** 0-100, drives the bar on the right. */
  quality: number;
  canDecrease: boolean;
  canIncrease: boolean;
  /** True when the next tier up exists but is still locked. */
  nextLocked?: boolean;
  onStep: (direction: 1 | -1) => void;
  /** Tailwind bg-* class for this row's little identity dot + quality bar. */
  color?: string;
}

/**
 * The core editing control of the design flow:
 * label on the left, a pill with < value > in the middle, quality bar on the right.
 */
export function StepperRow({
  label,
  blurb,
  value,
  subValue,
  quality,
  canDecrease,
  canIncrease,
  nextLocked = false,
  onStep,
  color = 'bg-accent',
}: Props) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="w-[70px] shrink-0">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold leading-tight text-white/90">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
          {label}
        </div>
        {blurb && <div className="mt-0.5 text-[10px] leading-tight text-white/35">{blurb}</div>}
      </div>

      <div className="card-inset flex min-w-0 flex-1 items-center">
        <StepButton
          direction={-1}
          disabled={!canDecrease}
          locked={false}
          onPress={() => onStep(-1)}
        />

        <div className="min-w-0 flex-1 overflow-hidden px-1 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              <div className="truncate text-[12.5px] font-semibold text-white">{value}</div>
              {subValue && (
                <div className="tnum truncate text-[10px] text-white/40">{subValue}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <StepButton
          direction={1}
          disabled={!canIncrease && !nextLocked}
          locked={nextLocked}
          onPress={() => onStep(1)}
        />
      </div>

      <QualityBar value={quality} color={color} />
    </div>
  );
}

function StepButton({
  direction,
  disabled,
  locked,
  onPress,
}: {
  direction: 1 | -1;
  disabled: boolean;
  locked: boolean;
  onPress: () => void;
}) {
  const Icon = locked ? Lock : direction === 1 ? ChevronRight : ChevronLeft;
  const inactive = disabled || locked;

  return (
    <motion.button
      type="button"
      aria-label={direction === 1 ? 'Increase' : 'Decrease'}
      onClick={() => !inactive && onPress()}
      whileTap={inactive ? undefined : { scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className={`flex h-11 w-9 shrink-0 items-center justify-center rounded-2xl transition-colors ${
        inactive ? 'text-white/15' : 'text-white/70 active:bg-white/5'
      }`}
    >
      <Icon size={locked ? 13 : 18} strokeWidth={2.4} />
    </motion.button>
  );
}
