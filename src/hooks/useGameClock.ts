import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

/** One in-game day lasts this long in real milliseconds at 1x speed. */
export const DAY_LENGTH_MS = 10_000;

/**
 * The real-time clock. While the game is playing, a day ticks every
 * DAY_LENGTH_MS / speed milliseconds. Pausing (speed 0) clears the interval
 * entirely, so nothing runs in the background.
 */
export function useGameClock() {
  const speed = useGameStore((s) => s.speed);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (speed === 0) return;

    const interval = window.setInterval(tick, DAY_LENGTH_MS / speed);
    return () => window.clearInterval(interval);
  }, [speed, tick]);
}
