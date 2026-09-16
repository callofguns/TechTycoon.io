import type { ComponentDef, ComponentId, PartSelection } from '../types';

/**
 * The parts catalogue.
 *
 * Tweaking the game is mostly done here: `cost` drives how expensive a phone
 * is to build, `quality` drives how good it is, and `weight` decides how much
 * each part matters to the overall quality score (all weights add up to 1).
 *
 * Each tier's `name` is a real spec value, not a made-up marketing name — a
 * CPU shows "2.8GHz", not "Performance A6". `unlockCost` gates the best two
 * tiers of every part behind an R&D purchase (see buyUnlock in the store) —
 * cash AND research points, both spent at once. `null` means it's available
 * from the start.
 */
export const COMPONENTS: ComponentDef[] = [
  {
    id: 'display',
    label: 'Display',
    blurb: 'Refresh rate',
    weight: 0.16,
    tiers: [
      { name: '60Hz', cost: 22, quality: 22, unlockCost: null },
      { name: '90Hz', cost: 58, quality: 52, unlockCost: null },
      {
        name: '120Hz',
        cost: 104,
        quality: 76,
        unlockCost: { cash: 100_000, research: 110 },
      },
      {
        name: '144Hz',
        cost: 176,
        quality: 96,
        unlockCost: { cash: 900_000, research: 650 },
      },
    ],
  },
  {
    id: 'cpu',
    label: 'Processor',
    blurb: 'Clock speed',
    weight: 0.16,
    tiers: [
      { name: '1.2GHz', cost: 28, quality: 25, unlockCost: null },
      { name: '2.0GHz', cost: 62, quality: 48, unlockCost: null },
      {
        name: '2.8GHz',
        cost: 118,
        quality: 72,
        unlockCost: { cash: 100_000, research: 110 },
      },
      {
        name: '3.4GHz',
        cost: 210,
        quality: 95,
        unlockCost: { cash: 900_000, research: 650 },
      },
    ],
  },
  {
    id: 'gpu',
    label: 'Graphics',
    blurb: 'GPU cores',
    weight: 0.12,
    tiers: [
      { name: '2-core', cost: 20, quality: 22, unlockCost: null },
      { name: '4-core', cost: 48, quality: 50, unlockCost: null },
      {
        name: '8-core',
        cost: 95,
        quality: 75,
        unlockCost: { cash: 45_000, research: 55 },
      },
      {
        name: '16-core',
        cost: 175,
        quality: 96,
        unlockCost: { cash: 350_000, research: 320 },
      },
    ],
  },
  {
    id: 'ram',
    label: 'Memory',
    blurb: 'RAM',
    weight: 0.1,
    tiers: [
      { name: '2GB', cost: 16, quality: 20, unlockCost: null },
      { name: '4GB', cost: 38, quality: 48, unlockCost: null },
      {
        name: '8GB',
        cost: 78,
        quality: 74,
        unlockCost: { cash: 28_000, research: 35 },
      },
      {
        name: '16GB',
        cost: 145,
        quality: 97,
        unlockCost: { cash: 200_000, research: 200 },
      },
    ],
  },
  {
    id: 'storage',
    label: 'Storage',
    blurb: 'Capacity',
    weight: 0.08,
    tiers: [
      { name: '16GB', cost: 12, quality: 20, unlockCost: null },
      { name: '64GB', cost: 30, quality: 50, unlockCost: null },
      {
        name: '256GB',
        cost: 60,
        quality: 76,
        unlockCost: { cash: 18_000, research: 25 },
      },
      {
        name: '1TB',
        cost: 110,
        quality: 98,
        unlockCost: { cash: 120_000, research: 130 },
      },
    ],
  },
  {
    id: 'battery',
    label: 'Battery',
    blurb: 'Capacity',
    weight: 0.12,
    tiers: [
      { name: '3000mAh', cost: 14, quality: 24, unlockCost: null },
      { name: '4500mAh', cost: 32, quality: 55, unlockCost: null },
      {
        name: '5500mAh',
        cost: 66,
        quality: 82,
        unlockCost: { cash: 45_000, research: 55 },
      },
      {
        name: '6000mAh',
        cost: 112,
        quality: 98,
        unlockCost: { cash: 350_000, research: 320 },
      },
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    blurb: 'Megapixels',
    weight: 0.14,
    tiers: [
      { name: '12MP', cost: 18, quality: 20, unlockCost: null },
      { name: '48MP', cost: 54, quality: 50, unlockCost: null },
      {
        name: '64MP',
        cost: 112,
        quality: 78,
        unlockCost: { cash: 70_000, research: 80 },
      },
      {
        name: '200MP',
        cost: 195,
        quality: 97,
        unlockCost: { cash: 600_000, research: 480 },
      },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    blurb: 'Build material',
    weight: 0.07,
    tiers: [
      { name: 'Polycarbonate', cost: 9, quality: 25, unlockCost: null },
      { name: 'Aluminium', cost: 26, quality: 55, unlockCost: null },
      {
        name: 'Glass + Steel',
        cost: 52,
        quality: 80,
        unlockCost: { cash: 12_000, research: 20 },
      },
      {
        name: 'Titanium',
        cost: 96,
        quality: 99,
        unlockCost: { cash: 70_000, research: 90 },
      },
    ],
  },
  {
    id: 'misc',
    label: 'Features',
    blurb: 'Connectivity & extras',
    weight: 0.05,
    // Each tier here bundles several real features at once, rather than
    // tracking WiFi/Bluetooth/network/cameras/biometrics as separate parts.
    tiers: [
      { name: '2G · Single cam', cost: 5, quality: 15, unlockCost: null },
      { name: '3G · WiFi · BT 2', cost: 15, quality: 40, unlockCost: null },
      {
        name: '4G · Dual cam · Fingerprint',
        cost: 35,
        quality: 70,
        unlockCost: { cash: 8_000, research: 15 },
      },
      {
        name: '5G · Triple cam · Face ID · WiFi 6',
        cost: 80,
        quality: 95,
        unlockCost: { cash: 40_000, research: 60 },
      },
    ],
  },
];

/**
 * Components shown on the "Hardware" stage of the design flow.
 * Design (build material/look) lives on its own stage instead, since it's
 * about appearance rather than internals.
 */
export const HARDWARE_COMPONENT_IDS: ComponentId[] = [
  'display',
  'cpu',
  'gpu',
  'ram',
  'storage',
  'battery',
  'camera',
  'misc',
];
export const DESIGN_COMPONENT_IDS: ComponentId[] = ['design'];

export function getComponent(id: ComponentId): ComponentDef {
  const found = COMPONENTS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown component: ${id}`);
  return found;
}

/** The cheapest possible build — what a new draft starts from. */
export function defaultParts(): PartSelection {
  return {
    design: 0,
    display: 0,
    cpu: 0,
    gpu: 0,
    ram: 0,
    storage: 0,
    battery: 0,
    camera: 0,
    misc: 0,
  };
}

/**
 * How far each component's R&D has been bought up to, at the very start —
 * tier 1 (the second option) ships already unlocked on every part, matching
 * the tiers whose unlockCost is null.
 */
export function defaultUnlockedTierIndex(): Record<ComponentId, number> {
  return {
    design: 1,
    display: 1,
    cpu: 1,
    gpu: 1,
    ram: 1,
    storage: 1,
    battery: 1,
    camera: 1,
    misc: 1,
  };
}

/**
 * A tier is unlocked once its own index is at or below the highest tier
 * that's been bought for that component. Tiers unlock strictly in order —
 * you can't skip ahead to the top spec without buying the one before it.
 */
export function isTierUnlocked(
  componentId: ComponentId,
  tierIndex: number,
  unlockedTierIndex: Record<ComponentId, number>,
): boolean {
  return tierIndex <= (unlockedTierIndex[componentId] ?? 0);
}
