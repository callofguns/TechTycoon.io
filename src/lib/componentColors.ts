import {
  BatteryFull,
  Camera,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  Monitor,
  Palette,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentId } from '../types';

/**
 * A distinct color per phone component, so the design flow (steppers, the
 * detail sheet's component list) reads as more than one flat wall of blue.
 * Tailwind class names are spelled out in full here — not built with
 * template strings — so its JIT scanner can actually find them.
 */
export const COMPONENT_COLORS: Record<
  ComponentId,
  { dot: string; bar: string; text: string; border: string; softBg: string }
> = {
  display: {
    dot: 'bg-violet-400',
    bar: 'bg-violet-400',
    text: 'text-violet-400',
    border: 'border-violet-400/60',
    softBg: 'bg-violet-400/10',
  },
  cpu: {
    dot: 'bg-sky-400',
    bar: 'bg-sky-400',
    text: 'text-sky-400',
    border: 'border-sky-400/60',
    softBg: 'bg-sky-400/10',
  },
  gpu: {
    dot: 'bg-indigo-400',
    bar: 'bg-indigo-400',
    text: 'text-indigo-400',
    border: 'border-indigo-400/60',
    softBg: 'bg-indigo-400/10',
  },
  ram: {
    dot: 'bg-teal-400',
    bar: 'bg-teal-400',
    text: 'text-teal-400',
    border: 'border-teal-400/60',
    softBg: 'bg-teal-400/10',
  },
  storage: {
    dot: 'bg-lime-400',
    bar: 'bg-lime-400',
    text: 'text-lime-400',
    border: 'border-lime-400/60',
    softBg: 'bg-lime-400/10',
  },
  battery: {
    dot: 'bg-emerald-400',
    bar: 'bg-emerald-400',
    text: 'text-emerald-400',
    border: 'border-emerald-400/60',
    softBg: 'bg-emerald-400/10',
  },
  camera: {
    dot: 'bg-amber-400',
    bar: 'bg-amber-400',
    text: 'text-amber-400',
    border: 'border-amber-400/60',
    softBg: 'bg-amber-400/10',
  },
  design: {
    dot: 'bg-fuchsia-400',
    bar: 'bg-fuchsia-400',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-400/60',
    softBg: 'bg-fuchsia-400/10',
  },
  misc: {
    dot: 'bg-rose-400',
    bar: 'bg-rose-400',
    text: 'text-rose-400',
    border: 'border-rose-400/60',
    softBg: 'bg-rose-400/10',
  },
};

/** One representative icon per component, for the Research screen's category strip. */
export const COMPONENT_ICONS: Record<ComponentId, LucideIcon> = {
  display: Monitor,
  cpu: Cpu,
  gpu: Gauge,
  ram: MemoryStick,
  storage: HardDrive,
  battery: BatteryFull,
  camera: Camera,
  design: Palette,
  misc: Wifi,
};
