import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { AnimatedNumber } from './AnimatedNumber';
import { money } from '../lib/format';
import type { Speed } from '../types';

const SPEEDS: { value: Speed; label: string }[] = [
  { value: 0, label: 'Pause' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
];

/**
 * Persistent header: day counter, cash, and the clock controls.
 * The day number bounces every time a day ticks over.
 */
export function TopBar() {
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);

  return (
    <header className="shrink-0 border-b border-white/[0.06] bg-ink-800/95 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 backdrop-blur">
      <div className="flex items-end justify-between">
        <div>
          <div className="label-dim">TechTycoon</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[13px] font-medium text-white/45">Day</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={day}
                initial={{ scale: 0.7, opacity: 0, y: 4 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.15, opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="tnum text-[20px] font-bold leading-none text-white"
              >
                {day}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="text-right">
          <div className="label-dim">Cash</div>
          <AnimatedNumber
            value={cash}
            format={money}
            className={`tnum mt-1 block text-[22px] font-bold leading-none ${
              cash < 0 ? 'text-red-400' : 'text-white'
            }`}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-pill border border-white/[0.07] bg-ink-700 p-1">
        {SPEEDS.map((option) => {
          const isActive = speed === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setSpeed(option.value)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              className="relative flex h-9 flex-1 items-center justify-center rounded-pill"
            >
              {isActive && (
                <motion.div
                  layoutId="speed-pill"
                  className="absolute inset-0 rounded-pill bg-accent"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-1 text-[12px] font-semibold ${
                  isActive ? 'text-white' : 'text-white/45'
                }`}
              >
                {option.value === 0 ? (
                  <Pause size={13} strokeWidth={2.6} fill="currentColor" />
                ) : option.value === 1 ? (
                  <Play size={13} strokeWidth={2.6} fill="currentColor" />
                ) : null}
                {option.value <= 1 ? (option.value === 0 ? 'Pause' : 'Play') : option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </header>
  );
}
