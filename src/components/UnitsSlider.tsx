import { motion } from 'framer-motion';
import { count } from '../lib/format';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const RESOLUTION = 1000;

/** Rounds a raw slider value to a "nice" number, coarser the bigger it gets. */
function niceRound(value: number, min: number, max: number): number {
  let step = 5;
  if (value >= 100_000) step = 5000;
  else if (value >= 10_000) step = 500;
  else if (value >= 1_000) step = 100;
  else if (value >= 100) step = 10;
  return Math.min(Math.max(Math.round(value / step) * step, min), max);
}

function toSliderPos(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  const v = Math.min(Math.max(value, min), max);
  const t = (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min));
  return Math.round(t * RESOLUTION);
}

function fromSliderPos(pos: number, min: number, max: number): number {
  if (max <= min) return min;
  const t = pos / RESOLUTION;
  const raw = Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)));
  return niceRound(raw, min, max);
}

/**
 * Drag-to-any-size batch slider. There's no fixed ceiling on how many units
 * you can plan to manufacture — `max` is however many you can actually
 * afford right now, so the slider's range grows with the economy instead of
 * hitting an arbitrary wall. The scale is logarithmic, since a useful batch
 * can be anywhere from 10 units to hundreds of thousands.
 */
export function UnitsSlider({ value, min, max, onChange }: Props) {
  // Keep the slider's own max at least as big as the current value, so
  // dragging still works if cash dropped below what's already selected.
  const sliderMax = Math.max(min, max, value);
  const pos = toSliderPos(value, min, sliderMax);

  return (
    <div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 6, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="tnum text-center text-[26px] font-bold leading-none text-white"
      >
        {count(value)}
      </motion.div>

      <input
        type="range"
        min={0}
        max={RESOLUTION}
        value={pos}
        onChange={(e) => onChange(fromSliderPos(Number(e.target.value), min, sliderMax))}
        className="slider mt-4"
        aria-label="Units to manufacture"
      />

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange(min)}
          className="tnum text-[11px] font-semibold text-white/35 active:text-white/60"
        >
          {count(min)}
        </button>
        <button
          type="button"
          onClick={() => onChange(sliderMax)}
          className="tnum text-[11px] font-semibold text-white/35 active:text-white/60"
        >
          {count(sliderMax)} max
        </button>
      </div>
    </div>
  );
}
