import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Wrapper every screen uses so tab changes slide/spring instead of snapping.
 * Also owns the page padding so screens don't each repeat it.
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.7 }}
      className="flex flex-col gap-3 px-4 pb-10 pt-6"
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 pt-1">
      <h2 className="label-dim">{children}</h2>
      {right}
    </div>
  );
}
