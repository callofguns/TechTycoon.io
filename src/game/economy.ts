import { COMPONENTS, getComponent } from './components';
import type { ComponentId, PartSelection, Product } from '../types';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ECONOMY / BALANCE
 * ─────────────────────────────────────────────────────────────────────────────
 * Everything about how many phones sell lives in this file. If the game feels
 * too easy or too slow, change the numbers in BALANCE first — every formula
 * below reads from it.
 */
export const BALANCE = {
  /** Cash the player starts with. */
  startingCash: 50_000,

  /** How many phones the whole market could buy in one day, at best. */
  marketSizePerDay: 4200,

  /**
   * Controls how quickly the market fills up. A bigger number means products
   * have to be more attractive before lots of people buy.
   */
  marketSaturation: 3.2,

  /** How strongly quality pulls buyers in (higher = quality matters more). */
  qualityExponent: 1.25,

  /** How strongly price pulls buyers in (higher = price matters more). */
  priceExponent: 1.55,

  /** Cheapest a phone of quality 0 could sensibly sell for. */
  basePriceFloor: 120,

  /** Extra price headroom a perfect (quality 100) phone earns. */
  priceQualityRange: 1280,

  /** Random day-to-day wobble in sales, e.g. 0.15 = +/-15%. */
  dailyNoise: 0.15,

  /** A phone is freshest at launch and slowly loses appeal over this many days. */
  noveltyHalfLifeDays: 70,

  /** The lowest novelty multiplier an old product can sink to. */
  noveltyFloor: 0.35,

  /** One-off tooling/setup cost when launching, as a multiple of unit cost. */
  toolingCostMultiplier: 50,
  minimumToolingCost: 2_000,

  /** Fixed running costs per day (office, staff, servers). */
  dailyOverhead: 250,

  /** Chance per day that a news event fires. */
  newsChancePerDay: 0.1,

  /** Savings account yearly rate, compounded daily on the Finance screen. */
  savingsApy: 0.04,

  /** How many days of sales history each product keeps for its sparkline. */
  historyLength: 30,
} as const;

/** Price brackets used by the pricing screen's 3-segment market bar. */
export const PRICE_TIERS = [
  { id: 'budget', label: 'Budget', max: 400 },
  { id: 'mid', label: 'Mid-range', max: 900 },
  { id: 'premium', label: 'Premium', max: Infinity },
] as const;

export type PriceTierId = (typeof PRICE_TIERS)[number]['id'];

export function priceTierOf(price: number): PriceTierId {
  if (price < PRICE_TIERS[0].max) return 'budget';
  if (price < PRICE_TIERS[1].max) return 'mid';
  return 'premium';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Overall quality of a phone, 0-100.
 * It is a weighted average of the chosen tiers (weights live in components.ts).
 */
export function computeQuality(parts: PartSelection): number {
  let total = 0;
  for (const def of COMPONENTS) {
    const tier = def.tiers[parts[def.id]] ?? def.tiers[0];
    total += tier.quality * def.weight;
  }
  return Math.round(total);
}

/** Dollars to manufacture one unit — just the sum of the chosen part costs. */
export function computeUnitCost(parts: PartSelection): number {
  let total = 0;
  for (const def of COMPONENTS) {
    const tier = def.tiers[parts[def.id]] ?? def.tiers[0];
    total += tier.cost;
  }
  return Math.round(total);
}

/** One-off cost to start manufacturing a design (factory tooling, certification). */
export function toolingCost(unitCost: number): number {
  return Math.max(BALANCE.minimumToolingCost, Math.round(unitCost * BALANCE.toolingCostMultiplier));
}

/**
 * The price buyers think a phone of this quality is "worth".
 * Selling below it feels like a bargain, above it feels expensive.
 */
export function fairPrice(quality: number): number {
  const q = clamp(quality, 0, 100) / 100;
  return Math.round(BALANCE.basePriceFloor + BALANCE.priceQualityRange * Math.pow(q, 1.35));
}

/** A sensible default asking price for a freshly designed phone. */
export function suggestedPrice(quality: number, unitCost: number): number {
  // Aim a bit under the "fair" price, but never below a healthy margin.
  const target = Math.round(fairPrice(quality) * 0.92);
  return Math.max(Math.round(unitCost * 1.8), target);
}

/**
 * How appealing a product is, as a single number.
 *
 * Two things matter: how good it is (quality) and how well priced it is
 * (fair price vs. what you actually charge). A cheap great phone scores high,
 * an overpriced weak phone scores near zero.
 */
export function valueScore(quality: number, price: number): number {
  const q = clamp(quality, 1, 100) / 100;
  const priceRatio = fairPrice(quality) / Math.max(price, 1);
  return Math.pow(q, BALANCE.qualityExponent) * Math.pow(priceRatio, BALANCE.priceExponent);
}

/**
 * Products sell best when new and slowly fade as they age.
 * Returns a multiplier between noveltyFloor and 1.
 */
export function noveltyFactor(ageInDays: number): number {
  const decay = Math.exp(-Math.max(0, ageInDays) / BALANCE.noveltyHalfLifeDays);
  return BALANCE.noveltyFloor + (1 - BALANCE.noveltyFloor) * decay;
}

export interface DailySale {
  productId: string;
  units: number;
  revenue: number;
  /** Revenue minus manufacturing cost for the units sold that day. */
  profit: number;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE MAIN SALES FORMULA — tweak this to change how the game plays.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. Score every product on the market with `valueScore` (quality vs price),
 *    then fade it a little for age with `noveltyFactor`.
 * 2. Add all the scores up. The bigger the total, the more of the market
 *    actually decides to buy something today (`marketPull`).
 * 3. Split today's buyers between products in proportion to their scores,
 *    with a little random wobble so no two days look identical.
 *
 * @param products      every product on sale (yours and the rivals')
 * @param currentDay    the day being simulated, used for product age
 * @param demandMult    news-event multiplier on overall demand (1 = normal)
 * @param costMult      news-event multiplier on manufacturing costs (1 = normal)
 * @param random        injectable RNG, handy if you ever want repeatable tests
 */
export function simulateDay(
  products: Product[],
  currentDay: number,
  demandMult: number,
  costMult: number,
  random: () => number = Math.random,
): DailySale[] {
  if (products.length === 0) return [];

  const scores = products.map((p) => {
    const age = currentDay - p.launchedOnDay;
    return valueScore(p.quality, p.price) * noveltyFactor(age);
  });

  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  if (totalScore <= 0) {
    return products.map((p) => ({ productId: p.id, units: 0, revenue: 0, profit: 0 }));
  }

  // How much of the potential market buys anything at all today (0-1).
  const marketPull = totalScore / (totalScore + BALANCE.marketSaturation);
  const buyersToday = BALANCE.marketSizePerDay * marketPull * demandMult;

  return products.map((product, i) => {
    const share = scores[i] / totalScore;
    const wobble = 1 + (random() * 2 - 1) * BALANCE.dailyNoise;
    const units = Math.max(0, Math.round(buyersToday * share * wobble));

    const revenue = units * product.price;
    const cost = units * product.unitCost * costMult;

    return { productId: product.id, units, revenue, profit: revenue - cost };
  });
}

/** Profit on a single unit right now, after any cost-inflating news event. */
export function profitPerUnit(price: number, unitCost: number, costMult = 1): number {
  return Math.round(price - unitCost * costMult);
}

/**
 * Market share per price bracket, based on how many units each bracket
 * is currently expected to move. Used by the 3-segment bar on the Pricing
 * screen so the player can see where the competition sits.
 */
export function priceTierShares(products: Product[], currentDay: number): Record<PriceTierId, number> {
  const totals: Record<PriceTierId, number> = { budget: 0, mid: 0, premium: 0 };

  for (const p of products) {
    const age = currentDay - p.launchedOnDay;
    totals[priceTierOf(p.price)] += valueScore(p.quality, p.price) * noveltyFactor(age);
  }

  const sum = totals.budget + totals.mid + totals.premium;
  if (sum <= 0) {
    // Nothing on sale yet — show an even split rather than an empty bar.
    return { budget: 34, mid: 33, premium: 33 };
  }

  return {
    budget: Math.round((totals.budget / sum) * 100),
    mid: Math.round((totals.mid / sum) * 100),
    premium: Math.round((totals.premium / sum) * 100),
  };
}

/** Daily interest rate derived from the yearly APY (compounded daily). */
export function dailySavingsRate(): number {
  return Math.pow(1 + BALANCE.savingsApy, 1 / 365) - 1;
}

/** How good a chosen tier is, 0-100 — drives the little bars in the steppers. */
export function tierQualityPercent(componentId: ComponentId, tierIndex: number): number {
  const def = getComponent(componentId);
  const tier = def.tiers[tierIndex] ?? def.tiers[0];
  return tier.quality;
}
