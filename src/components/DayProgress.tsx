import { useEffect, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { DAY_LENGTH_MS } from '../hooks/useGameClock';

/**
 * Hairline bar under the header that fills up as the current day goes by.
 * It drives a motion value directly, so it animates without re-rendering React.
 */
export function DayProgress() {
  const day = useGameStore((s) => s.day);
  const speed = useGameStore((s) => s.speed);

  const progress = useMotionValue(0);
  const startedAt = useRef(performance.now());

  // Restart the fill whenever a new day begins or the speed changes.
  useEffect(() => {
    startedAt.current = performance.now();
    progress.set(0);
  }, [day, speed, progress]);

  useAnimationFrame(() => {
    if (speed === 0) return; // paused: freeze wherever we are
    const duration = DAY_LENGTH_MS / speed;
    progress.set(Math.min(1, (performance.now() - startedAt.current) / duration));
  });

  return (
    <div className="h-[2px] w-full shrink-0 bg-white/[0.05]">
      <motion.div
        className="h-full w-full origin-left bg-accent/70"
        style={{ scaleX: progress }}
      />
    </div>
  );
}
