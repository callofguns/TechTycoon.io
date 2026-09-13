import { COMPONENTS } from './components';
import { computeQuality, computeUnitCost, fairPrice, clamp } from './economy';
import type { PartSelection, Product, Rival } from '../types';

/**
 * The AI competition. Two rival companies, each selling one phone at a time.
 * They are deliberately simple: they pick mid-ish parts, price near what the
 * phone is worth, drift their price a little, and release a new generation
 * every couple of months so the player can't coast forever.
 */

export const RIVALS: Rival[] = [
  { id: 'nimbus', name: 'Nimbus Mobile', generation: 1 },
  { id: 'vertex', name: 'Vertex Devices', generation: 1 },
];

/** How many days between rival product refreshes. */
const REFRESH_INTERVAL_DAYS = 55;

const MODEL_SUFFIXES = ['One', 'Pro', 'Ultra', 'Max', 'Neo', 'Edge'];

function randomInt(max: number, random: () => number): number {
  return Math.floor(random() * max);
}

/**
 * Pick parts around a target tier index. `spread` lets some parts land one
 * step above or below the target so rival phones aren't all identical.
 */
function pickParts(targetTier: number, random: () => number): PartSelection {
  const parts = {} as PartSelection;
  for (const def of COMPONENTS) {
    const drift = randomInt(3, random) - 1; // -1, 0 or +1
    parts[def.id] = clamp(targetTier + drift, 0, def.tiers.length - 1);
  }
  return parts;
}

/**
 * Create a rival's phone. `generation` slowly raises the tier they aim for,
 * so rivals get better over time (gen 1 aims at tier 1, gen 3 at tier 2...).
 */
export function createRivalProduct(
  rival: Rival,
  day: number,
  random: () => number = Math.random,
): Product {
  const targetTier = clamp(Math.floor((rival.generation + 1) / 2), 0, 3);
  const parts = pickParts(targetTier, random);
  const quality = computeQuality(parts);
  const unitCost = computeUnitCost(parts);

  // Rivals ask somewhere between 80% and 105% of what the phone is worth.
  const price = Math.max(
    Math.round(unitCost * 1.5),
    Math.round(fairPrice(quality) * (0.8 + random() * 0.25)),
  );

  const suffix = MODEL_SUFFIXES[randomInt(MODEL_SUFFIXES.length, random)];
  const brand = rival.name.split(' ')[0];

  return {
    id: `${rival.id}-g${rival.generation}`,
    name: `${brand} ${suffix} ${rival.generation}`,
    ownerId: rival.id,
    parts,
    quality,
    unitCost,
    price,
    launchedOnDay: day,
    unitsSoldTotal: 0,
    revenueTotal: 0,
    profitTotal: 0,
    history: [],
  };
}

/** The starting line-up of rival phones on day 1. */
export function createInitialRivalProducts(random: () => number = Math.random): Product[] {
  return RIVALS.map((rival) => createRivalProduct(rival, 1, random));
}

export interface RivalTurnResult {
  products: Product[];
  rivals: Rival[];
  /** Names of any phones the rivals launched today, for the news feed. */
  launched: string[];
}

/**
 * Runs once per day tick. Rivals nudge their prices and, on schedule, replace
 * their phone with a newer generation.
 */
export function runRivalTurn(
  rivals: Rival[],
  products: Product[],
  day: number,
  random: () => number = Math.random,
): RivalTurnResult {
  const nextRivals = [...rivals];
  let nextProducts = [...products];
  const launched: string[] = [];

  nextRivals.forEach((rival, index) => {
    const current = nextProducts.find((p) => p.ownerId === rival.id);

    // Time for a new model? Replace the old one.
    if (!current || day - current.launchedOnDay >= REFRESH_INTERVAL_DAYS) {
      const upgraded: Rival = { ...rival, generation: rival.generation + (current ? 1 : 0) };
      nextRivals[index] = upgraded;

      const replacement = createRivalProduct(upgraded, day, random);
      nextProducts = nextProducts.filter((p) => p.ownerId !== rival.id);
      nextProducts.push(replacement);
      launched.push(replacement.name);
      return;
    }

    // Otherwise drift the price by a few percent, staying above cost.
    if (random() < 0.18) {
      const drift = 1 + (random() * 0.1 - 0.05);
      const nextPrice = Math.max(Math.round(current.unitCost * 1.3), Math.round(current.price * drift));
      nextProducts = nextProducts.map((p) => (p.id === current.id ? { ...p, price: nextPrice } : p));
    }
  });

  return { products: nextProducts, rivals: nextRivals, launched };
}
