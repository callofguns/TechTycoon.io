import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BALANCE } from '../game/economy';

/**
 * Hairline bar under the header that fills up as the current day goes by.
 * Reads dayProgressMs straight from the store, so it — like the clock
 * itself — never resets when the player changes speed.
 */
export function DayProgress() {
  const progressMs = useGameStore((s) => s.dayProgressMs);
  const progress = Math.min(1, progressMs / BALANCE.dayLengthMs);

  return (
    <div className="h-[2px] w-full shrink-0 bg-white/[0.05]">
      <motion.div
        className="h-full w-full origin-left bg-accent/70"
        animate={{ scaleX: progress }}
        transition={{ duration: 0.12, ease: 'linear' }}
      />
    </div>
  );
}
