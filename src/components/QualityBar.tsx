import { motion } from 'framer-motion';

interface Props {
  /** 0-100 */
  value: number;
  /** Height of the bar in pixels. */
  height?: number;
  showLabel?: boolean;
  /** Tailwind bg-* class for the fill. Defaults to the app accent. */
  color?: string;
}

/**
 * The small vertical "how good is this" bar that sits on the right of every
 * stepper row, with the percentage underneath it.
 */
export function QualityBar({ value, height = 34, showLabel = true, color = 'bg-accent' }: Props) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  // Keep a sliver of colour even at very low values so the bar reads as a bar.
  const fill = Math.max(pct, 8);

  return (
    <div className="flex w-[30px] shrink-0 flex-col items-center gap-1">
      <div
        className="flex w-[6px] flex-col justify-end overflow-hidden rounded-full bg-white/10"
        style={{ height }}
      >
        <motion.div
          className={`w-full rounded-full ${color}`}
          initial={false}
          animate={{ height: `${fill}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        />
      </div>
      {showLabel && <span className="tnum text-[10px] font-medium text-white/45">{pct}%</span>}
    </div>
  );
}
