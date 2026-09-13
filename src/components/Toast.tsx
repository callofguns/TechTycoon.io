import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../store/toastStore';

/**
 * Short confirmation message that floats above the bottom nav.
 * Lives at the top of the app so it survives switching screens.
 */
export function Toast() {
  const message = useToastStore((s) => s.message);
  const id = useToastStore((s) => s.id);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="pointer-events-none absolute inset-x-0 bottom-[88px] z-50 px-6"
        >
          <div className="rounded-2xl border border-white/10 bg-ink-600/95 px-4 py-3 text-center text-[12.5px] font-medium text-white shadow-card backdrop-blur">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
