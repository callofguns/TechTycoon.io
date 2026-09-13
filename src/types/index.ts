/**
 * Shared types for TechTycoon.io.
 * Everything the game knows about lives in these shapes.
 */

/** The five parts that make up a phone. */
export type ComponentId = 'cpu' | 'screen' | 'battery' | 'camera' | 'build';

/** One option for a component, e.g. the "Flagship" CPU. */
export interface ComponentTier {
  name: string;
  /** What one unit of this part costs to manufacture, in dollars. */
  cost: number;
  /** How good this part is, 0-100. Feeds the product's overall quality score. */
  quality: number;
  /**
   * Lifetime revenue (in dollars) the player must have earned before this tier
   * can be picked. 0 means it is available from the start.
   */
  unlockRevenue: number;
}

export interface ComponentDef {
  id: ComponentId;
  label: string;
  /** Short line describing what this part affects, shown under the label. */
  blurb: string;
  /**
   * How much this part matters for overall quality.
   * All weights across components add up to 1.
   */
  weight: number;
  tiers: ComponentTier[];
}

/** A tier index for every component, e.g. { cpu: 2, screen: 1, ... }. */
export type PartSelection = Record<ComponentId, number>;

/** One day of sales for a product, used for the mini sparkline charts. */
export interface DayPoint {
  day: number;
  units: number;
  revenue: number;
}

export interface Product {
  id: string;
  name: string;
  /** 'player' for your products, otherwise the rival's id. */
  ownerId: string;
  parts: PartSelection;
  /** 0-100, computed from the parts at launch. */
  quality: number;
  /** Dollars to manufacture one unit (sum of part costs), fixed at launch. */
  unitCost: number;
  price: number;
  launchedOnDay: number;
  unitsSoldTotal: number;
  revenueTotal: number;
  profitTotal: number;
  /** Rolling window of recent days (most recent last). */
  history: DayPoint[];
}

export interface Rival {
  id: string;
  name: string;
  /** Rivals refresh their phone every so often; this tracks the generation. */
  generation: number;
}

export type NewsKind = 'cost' | 'demand';

export interface NewsEvent {
  id: string;
  day: number;
  headline: string;
  body: string;
  kind: NewsKind;
  /** Multiplier applied while the event is live, e.g. 1.15 = +15%. */
  multiplier: number;
  /** Counts down by 1 each day. The event is over at 0. */
  daysRemaining: number;
}

/** 0 = paused. 1/2/3 = speed multipliers for the real-time clock. */
export type Speed = 0 | 1 | 2 | 3;

/** The phone currently being designed on the Design screen. */
export interface ProductDraft {
  name: string;
  parts: PartSelection;
  price: number;
  /** True once the player has typed a name, so we stop auto-suggesting one. */
  nameTouched: boolean;
}

export type TabId = 'home' | 'design' | 'market' | 'finance' | 'more';
