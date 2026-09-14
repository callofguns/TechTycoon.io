import type { ComponentId } from '../types';

/**
 * A distinct color per phone component, so the design flow (steppers, the
 * detail sheet's component list) reads as more than one flat wall of blue.
 * Tailwind class names are spelled out in full here — not built with
 * template strings — so its JIT scanner can actually find them.
 */
export const COMPONENT_COLORS: Record<ComponentId, { dot: string; bar: string; text: string }> = {
  cpu: { dot: 'bg-sky-400', bar: 'bg-sky-400', text: 'text-sky-400' },
  screen: { dot: 'bg-violet-400', bar: 'bg-violet-400', text: 'text-violet-400' },
  battery: { dot: 'bg-emerald-400', bar: 'bg-emerald-400', text: 'text-emerald-400' },
  camera: { dot: 'bg-amber-400', bar: 'bg-amber-400', text: 'text-amber-400' },
  build: { dot: 'bg-fuchsia-400', bar: 'bg-fuchsia-400', text: 'text-fuchsia-400' },
};
