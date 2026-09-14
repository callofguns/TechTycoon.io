import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  className?: string;
}

/** The big glowing pill button used for the main action on a screen. */
export function PillButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}: Props) {
  const base =
    'flex h-[52px] w-full items-center justify-center gap-2 rounded-pill text-[15px] font-semibold tracking-tight transition-colors';

  const look = disabled
    ? 'bg-white/[0.06] text-white/30'
    : variant === 'primary'
      ? 'bg-accent text-white shadow-glow'
      : variant === 'danger'
        ? 'bg-red-500 text-white shadow-[0_8px_30px_-8px_rgba(239,68,68,0.6)]'
        : 'border border-white/10 bg-white/[0.04] text-white/80';

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onClick?.()}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className={`${base} ${look} ${className}`}
    >
      {children}
    </motion.button>
  );
}
