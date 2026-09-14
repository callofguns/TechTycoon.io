import type { ComponentDef, ComponentId, ComponentTier, PartSelection } from '../types';
import { parseISODate } from './calendar';

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
 * from the start. `availableFrom` ties that same tier to the real date the
 * tech existed — see isTierDateReady below.
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
        unlockCost: { cash: 22_000, research: 160 },
        availableFrom: '2020-02-11', // Galaxy S20 — 120Hz goes mainstream on a flagship
      },
      {
        name: '144Hz',
        cost: 176,
        quality: 96,
        unlockCost: { cash: 110_000, research: 560 },
        availableFrom: '2021-01-29', // Galaxy S21 Ultra — first adaptive LTPO panel
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
        unlockCost: { cash: 18_000, research: 140 },
        availableFrom: '2013-09-20', // iPhone 5s — the first 64-bit phone chip
      },
      {
        name: '3.4GHz',
        cost: 210,
        quality: 95,
        unlockCost: { cash: 90_000, research: 520 },
        availableFrom: '2019-09-20', // iPhone 11 — 7nm A13 Bionic
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
        unlockCost: { cash: 17_000, research: 135 },
        availableFrom: '2017-09-22', // multi-core mobile GPUs become the norm
      },
      {
        name: '16-core',
        cost: 175,
        quality: 96,
        unlockCost: { cash: 95_000, research: 540 },
        availableFrom: '2022-09-16', // console-class mobile graphics arrive
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
        unlockCost: { cash: 15_000, research: 120 },
        availableFrom: '2018-10-30', // OnePlus 6T — 8GB becomes a real flagship spec
      },
      {
        name: '16GB',
        cost: 145,
        quality: 97,
        unlockCost: { cash: 80_000, research: 480 },
        availableFrom: '2023-02-01', // 16GB gaming-flagship Android phones arrive
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
        unlockCost: { cash: 13_000, research: 115 },
        availableFrom: '2016-09-16', // iPhone 7 — the first 256GB iPhone
      },
      {
        name: '1TB',
        cost: 110,
        quality: 98,
        unlockCost: { cash: 70_000, research: 440 },
        availableFrom: '2021-09-24', // iPhone 13 Pro — the first 1TB iPhone
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
        unlockCost: { cash: 14_000, research: 110 },
        availableFrom: '2019-09-19', // Mate 30 Pro — big cell + real fast charging
      },
      {
        name: '6000mAh',
        cost: 112,
        quality: 98,
        unlockCost: { cash: 75_000, research: 460 },
        availableFrom: '2024-01-11', // Honor Magic6 Pro — silicon-carbon anode cell
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
        unlockCost: { cash: 28_000, research: 180 },
        availableFrom: '2019-08-28', // Redmi Note 8 Pro — first 64MP phone camera
      },
      {
        name: '200MP',
        cost: 195,
        quality: 97,
        unlockCost: { cash: 130_000, research: 600 },
        availableFrom: '2023-02-17', // Galaxy S23 Ultra — 200MP sensor + periscope zoom
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
        unlockCost: { cash: 32_000, research: 190 },
        availableFrom: '2010-06-24', // iPhone 4 — glass front and back, steel band
      },
      {
        name: 'Titanium',
        cost: 96,
        quality: 99,
        unlockCost: { cash: 150_000, research: 640 },
        availableFrom: '2023-09-22', // iPhone 15 Pro — titanium frame
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
        unlockCost: { cash: 20_000, research: 150 },
        availableFrom: '2013-09-10', // iPhone 5s — Touch ID lands as 4G LTE goes mainstream
      },
      {
        name: '5G · Triple cam · Face ID · WiFi 6',
        cost: 80,
        quality: 95,
        unlockCost: { cash: 60_000, research: 420 },
        availableFrom: '2020-10-23', // iPhone 12 — first 5G iPhone, rest already common by now
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

/** True once the in-game calendar has actually reached this tier's real-world debut. */
export function isTierDateReady(tier: ComponentTier, currentDate: Date): boolean {
  if (!tier.availableFrom) return true;
  return currentDate.getTime() >= parseISODate(tier.availableFrom).getTime();
}

/**
 * The best tier of a component that actually exists yet on the current date —
 * used to keep rivals period-appropriate too (see rivals.ts), since they pick
 * parts directly rather than going through the player's buy-to-unlock flow.
 */
export function highestDateAvailableTierIndex(componentId: ComponentId, currentDate: Date): number {
  const tiers = getComponent(componentId).tiers;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (isTierDateReady(tiers[i], currentDate)) return i;
  }
  return 0;
}
