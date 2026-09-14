import type { ComponentDef, ComponentId, PartSelection } from '../types';

/**
 * The parts catalogue.
 *
 * Tweaking the game is mostly done here: `cost` drives how expensive a phone
 * is to build, `quality` drives how good it is, and `weight` decides how much
 * each part matters to the overall quality score (all weights add up to 1).
 *
 * `unlockCost` gates the best two tiers of every part behind an R&D purchase
 * (see buyUnlock in the store) — cash AND research points, both spent at
 * once. `null` means it's available from the start.
 */
export const COMPONENTS: ComponentDef[] = [
  {
    id: 'cpu',
    label: 'Processor',
    blurb: 'Speed and smoothness',
    weight: 0.28,
    tiers: [
      { name: 'Budget A1', cost: 28, quality: 25, unlockCost: null },
      { name: 'Standard A3', cost: 62, quality: 48, unlockCost: null },
      { name: 'Performance A6', cost: 118, quality: 72, unlockCost: { cash: 18_000, research: 140 } },
      { name: 'Flagship A9', cost: 210, quality: 95, unlockCost: { cash: 90_000, research: 520 } },
    ],
  },
  {
    id: 'screen',
    label: 'Display',
    blurb: 'Panel type and refresh rate',
    weight: 0.24,
    tiers: [
      { name: '60Hz LCD', cost: 22, quality: 22, unlockCost: null },
      { name: '90Hz OLED', cost: 58, quality: 52, unlockCost: null },
      { name: '120Hz OLED', cost: 104, quality: 76, unlockCost: { cash: 22_000, research: 160 } },
      { name: '144Hz LTPO', cost: 176, quality: 96, unlockCost: { cash: 110_000, research: 560 } },
    ],
  },
  {
    id: 'battery',
    label: 'Battery',
    blurb: 'Capacity and charge speed',
    weight: 0.16,
    tiers: [
      { name: '3000mAh', cost: 14, quality: 24, unlockCost: null },
      { name: '4500mAh', cost: 32, quality: 55, unlockCost: null },
      { name: '5500mAh Fast', cost: 66, quality: 82, unlockCost: { cash: 14_000, research: 110 } },
      { name: '6000mAh Silicon', cost: 112, quality: 98, unlockCost: { cash: 75_000, research: 460 } },
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    blurb: 'Sensor and lens quality',
    weight: 0.2,
    tiers: [
      { name: '12MP Single', cost: 18, quality: 20, unlockCost: null },
      { name: '48MP Dual', cost: 54, quality: 50, unlockCost: null },
      { name: '64MP Triple OIS', cost: 112, quality: 78, unlockCost: { cash: 28_000, research: 180 } },
      { name: '200MP Periscope', cost: 195, quality: 97, unlockCost: { cash: 130_000, research: 600 } },
    ],
  },
  {
    id: 'build',
    label: 'Build material',
    blurb: 'Body finish and feel',
    weight: 0.12,
    tiers: [
      { name: 'Polycarbonate', cost: 9, quality: 25, unlockCost: null },
      { name: 'Aluminium', cost: 26, quality: 55, unlockCost: null },
      { name: 'Glass + Steel', cost: 52, quality: 80, unlockCost: { cash: 32_000, research: 190 } },
      { name: 'Titanium', cost: 96, quality: 99, unlockCost: { cash: 150_000, research: 640 } },
    ],
  },
];

/**
 * Components shown on the "Hardware" stage of the design flow.
 * Build material lives on the "Design" stage instead, since it is about looks.
 */
export const HARDWARE_COMPONENT_IDS: ComponentId[] = ['cpu', 'screen', 'battery', 'camera'];
export const DESIGN_COMPONENT_IDS: ComponentId[] = ['build'];

export function getComponent(id: ComponentId): ComponentDef {
  const found = COMPONENTS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown component: ${id}`);
  return found;
}

/** The cheapest possible build — what a new draft starts from. */
export function defaultParts(): PartSelection {
  return { cpu: 0, screen: 0, battery: 0, camera: 0, build: 0 };
}

/**
 * How far each component's R&D has been bought up to, at the very start —
 * tier 1 (the second option) ships already unlocked on every part, matching
 * the tiers whose unlockCost is null.
 */
export function defaultUnlockedTierIndex(): Record<ComponentId, number> {
  return { cpu: 1, screen: 1, battery: 1, camera: 1, build: 1 };
}

/**
 * A tier is unlocked once its own index is at or below the highest tier
 * that's been bought for that component. Tiers unlock strictly in order —
 * you can't skip ahead to Flagship without buying Performance first.
 */
export function isTierUnlocked(
  componentId: ComponentId,
  tierIndex: number,
  unlockedTierIndex: Record<ComponentId, number>,
): boolean {
  return tierIndex <= (unlockedTierIndex[componentId] ?? 0);
}
