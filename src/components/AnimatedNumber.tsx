import { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';

interface Props {
  value: number;
  /** Turns the raw number into the text shown, e.g. `money`. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * A number that springs to its new value instead of snapping.
 * Used for cash, units sold and any other stat that changes on a day tick.
 */
export function AnimatedNumber({ value, format = (v) => String(Math.round(v)), className }: Props) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 140, damping: 20, mass: 0.6 });
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplay(format(latest));
  });

  return <span className={className}>{display}</span>;
}
