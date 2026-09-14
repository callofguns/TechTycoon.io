import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

/** How often (real ms) the clock samples elapsed time and feeds it to the game. */
const SAMPLE_INTERVAL_MS = 100;

/**
 * The real-time clock. Every SAMPLE_INTERVAL_MS of real time, it tells the
 * store how much real time just passed; the store turns that into game-time
 * (real time × current speed) and banks it toward the current day.
 *
 * Speed changes swap which interval is running, but the progress already
 * banked lives in the store, not here — so switching Pause/1x/2x/3x never
 * resets how far into the current day you already were.
 */
export function useGameClock() {
  const speed = useGameStore((s) => s.speed);
  const advanceClock = useGameStore((s) => s.advanceClock);

  useEffect(() => {
    if (speed === 0) return;

    // Reset fresh each time this effect (re)starts, so neither a paused
    // stretch nor the moment right before a speed change gets counted.
    let last = performance.now();

    const interval = window.setInterval(() => {
      const now = performance.now();
      // Cap how much real time counts per sample. Browsers throttle timers
      // in backgrounded tabs, so without this, switching back to the tab
      // after a while away would suddenly simulate a burst of missed days —
      // the game is meant to only advance while you're actually looking at it.
      const realDelta = Math.min(now - last, SAMPLE_INTERVAL_MS * 5);
      last = now;
      advanceClock(realDelta);
    }, SAMPLE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [speed, advanceClock]);
}
