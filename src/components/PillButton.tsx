import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
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

  const look =
    variant === 'primary'
      ? disabled
        ? 'bg-white/[0.06] text-white/30'
        : 'bg-accent text-white shadow-glow'
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
