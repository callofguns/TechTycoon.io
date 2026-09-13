import type { ComponentDef, ComponentId, PartSelection } from '../types';

/**
 * The parts catalogue.
 *
 * Tweaking the game is mostly done here: `cost` drives how expensive a phone
 * is to build, `quality` drives how good it is, and `weight` decides how much
 * each part matters to the overall quality score (all weights add up to 1).
 *
 * `unlockRevenue` gates the best tiers behind lifetime revenue, so the player
 * works up to flagship parts instead of building the best phone on day 1.
 */
export const COMPONENTS: ComponentDef[] = [
  {
    id: 'cpu',
    label: 'Processor',
    blurb: 'Speed and smoothness',
    weight: 0.28,
    tiers: [
      { name: 'Budget A1', cost: 28, quality: 25, unlockRevenue: 0 },
      { name: 'Standard A3', cost: 62, quality: 48, unlockRevenue: 0 },
      { name: 'Performance A6', cost: 118, quality: 72, unlockRevenue: 120_000 },
      { name: 'Flagship A9', cost: 210, quality: 95, unlockRevenue: 600_000 },
    ],
  },
  {
    id: 'screen',
    label: 'Display',
    blurb: 'Panel type and refresh rate',
    weight: 0.24,
    tiers: [
      { name: '60Hz LCD', cost: 22, quality: 22, unlockRevenue: 0 },
      { name: '90Hz OLED', cost: 58, quality: 52, unlockRevenue: 0 },
      { name: '120Hz OLED', cost: 104, quality: 76, unlockRevenue: 150_000 },
      { name: '144Hz LTPO', cost: 176, quality: 96, unlockRevenue: 700_000 },
    ],
  },
  {
    id: 'battery',
    label: 'Battery',
    blurb: 'Capacity and charge speed',
    weight: 0.16,
    tiers: [
      { name: '3000mAh', cost: 14, quality: 24, unlockRevenue: 0 },
      { name: '4500mAh', cost: 32, quality: 55, unlockRevenue: 0 },
      { name: '5500mAh Fast', cost: 66, quality: 82, unlockRevenue: 90_000 },
      { name: '6000mAh Silicon', cost: 112, quality: 98, unlockRevenue: 500_000 },
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    blurb: 'Sensor and lens quality',
    weight: 0.2,
    tiers: [
      { name: '12MP Single', cost: 18, quality: 20, unlockRevenue: 0 },
      { name: '48MP Dual', cost: 54, quality: 50, unlockRevenue: 0 },
      { name: '64MP Triple OIS', cost: 112, quality: 78, unlockRevenue: 200_000 },
      { name: '200MP Periscope', cost: 195, quality: 97, unlockRevenue: 800_000 },
    ],
  },
  {
    id: 'build',
    label: 'Build material',
    blurb: 'Body finish and feel',
    weight: 0.12,
    tiers: [
      { name: 'Polycarbonate', cost: 9, quality: 25, unlockRevenue: 0 },
      { name: 'Aluminium', cost: 26, quality: 55, unlockRevenue: 0 },
      { name: 'Glass + Steel', cost: 52, quality: 80, unlockRevenue: 250_000 },
      { name: 'Titanium', cost: 96, quality: 99, unlockRevenue: 900_000 },
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

/** A tier is locked until the player has earned enough lifetime revenue. */
export function isTierUnlocked(
  componentId: ComponentId,
  tierIndex: number,
  lifetimeRevenue: number,
): boolean {
  const tier = getComponent(componentId).tiers[tierIndex];
  if (!tier) return false;
  return lifetimeRevenue >= tier.unlockRevenue;
}
