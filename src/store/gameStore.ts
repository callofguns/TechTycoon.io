import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BALANCE,
  clamp,
  computeQuality,
  computeUnitCost,
  dailySavingsRate,
  simulateDay,
  suggestedPrice,
  toolingCost,
} from '../game/economy';
import { activeModifiers, historicalEventsForDay } from '../game/news';
import { RIVALS, createInitialRivalProducts, runRivalTurn } from '../game/rivals';
import { defaultParts, getComponent, isTierUnlocked } from '../game/components';
import type {
  ComponentId,
  NewsEvent,
  Product,
  ProductDraft,
  Rival,
  Speed,
  TabId,
} from '../types';

/** One row in the finance ledger — a summary of a single day. */
export interface LedgerDay {
  day: number;
  revenue: number;
  manufacturingCost: number;
  overhead: number;
  interest: number;
  /** revenue − manufacturing − overhead + interest */
  netProfit: number;
  units: number;
}

interface GameState {
  // ── World ────────────────────────────────────────────────────────────────
  day: number;
  /**
   * Milliseconds of game-time banked toward the current day (0 to
   * BALANCE.dayLengthMs). Lives in the store — not a component — so that
   * changing speed only changes how fast it fills, never resets it.
   */
  dayProgressMs: number;
  cash: number;
  savings: number;
  /** Total money ever taken in by the player. Drives component unlocks. */
  lifetimeRevenue: number;
  speed: Speed;
  products: Product[];
  rivals: Rival[];
  news: NewsEvent[];
  ledger: LedgerDay[];

  // ── UI ───────────────────────────────────────────────────────────────────
  activeTab: TabId;
  draft: ProductDraft;

  // ── Actions ──────────────────────────────────────────────────────────────
  setTab: (tab: TabId) => void;
  setSpeed: (speed: Speed) => void;
  tick: () => void;
  /** Called by the game clock with however many real ms just passed. */
  advanceClock: (realDeltaMs: number) => void;

  stepDraftPart: (componentId: ComponentId, direction: 1 | -1) => void;
  setDraftName: (name: string) => void;
  stepDraftPrice: (delta: number) => void;
  setDraftPrice: (price: number) => void;
  stepDraftUnits: (delta: number) => void;
  resetDraft: () => void;
  launchProduct: () => { ok: boolean; message: string };

  setProductPrice: (productId: string, price: number) => void;
  discontinueProduct: (productId: string) => void;

  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;

  resetGame: () => void;
}

const NAME_IDEAS = ['Nova', 'Aster', 'Orbit', 'Pulse', 'Lumen', 'Atlas', 'Vega'];

function freshDraft(): ProductDraft {
  const parts = defaultParts();
  const quality = computeQuality(parts);
  const unitCost = computeUnitCost(parts);
  const idea = NAME_IDEAS[Math.floor(Math.random() * NAME_IDEAS.length)];
  return {
    name: `${idea} 1`,
    parts,
    price: suggestedPrice(quality, unitCost),
    unitsToManufacture: BALANCE.defaultBatchSize,
    nameTouched: false,
  };
}

function initialState() {
  return {
    day: 1,
    dayProgressMs: 0,
    cash: BALANCE.startingCash,
    savings: 0,
    lifetimeRevenue: 0,
    speed: 1 as Speed,
    products: createInitialRivalProducts(),
    rivals: RIVALS.map((r) => ({ ...r })),
    // Day 1 is seeded directly (rather than discovered by a tick) so the
    // very first headline — the iPhone launching — isn't missed.
    news: historicalEventsForDay(1),
    ledger: [] as LedgerDay[],
    activeTab: 'home' as TabId,
    draft: freshDraft(),
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      setTab: (tab) => set({ activeTab: tab }),

      setSpeed: (speed) => set({ speed }),

      /**
       * Advance the world by one day. Called by the game clock in App.tsx.
       * Order matters: news first (it sets today's modifiers), then rivals
       * (so a phone launched today is on sale today), then sales, then money.
       */
      tick: () =>
        set((state) => {
          const day = state.day + 1;

          // 1. Age existing news, keep the recent ones around for the feed.
          let news: NewsEvent[] = state.news
            .map((n) => ({ ...n, daysRemaining: Math.max(0, n.daysRemaining - 1) }))
            .slice(0, 8);

          // 2. Any real historical events landing on today's date.
          const todaysEvents = historicalEventsForDay(day);
          if (todaysEvents.length > 0) {
            news = [...todaysEvents, ...news].slice(0, 8);
          }

          const { demandMult } = activeModifiers(news);

          // 3. Rivals act (price drift / new generation).
          const rivalTurn = runRivalTurn(state.rivals, state.products, day);
          let products = rivalTurn.products;
          const rivals = rivalTurn.rivals;

          for (const name of rivalTurn.launched) {
            const headline: NewsEvent = {
              id: `rival-${day}-${name}`,
              day,
              headline: 'Rival launch',
              body: `${name} just went on sale.`,
              kind: 'demand',
              multiplier: 1, // purely informational, no effect on demand
              daysRemaining: 0,
            };
            news = [headline, ...news].slice(0, 8);
          }

          // 4. Sell phones.
          const sales = simulateDay(products, day, demandMult);
          const salesById = new Map(sales.map((s) => [s.productId, s]));

          let playerRevenue = 0;
          let playerProfit = 0;
          let playerUnits = 0;
          let playerManufacturing = 0;

          products = products.map((product) => {
            const sale = salesById.get(product.id);
            if (!sale) return product;

            if (product.ownerId === 'player') {
              playerRevenue += sale.revenue;
              playerProfit += sale.profit;
              playerUnits += sale.units;
              playerManufacturing += sale.revenue - sale.profit;
            }

            const history = [
              ...product.history,
              { day, units: sale.units, revenue: sale.revenue },
            ].slice(-BALANCE.historyLength);

            return {
              ...product,
              history,
              unitsInStock: Math.max(0, product.unitsInStock - sale.units),
              unitsSoldTotal: product.unitsSoldTotal + sale.units,
              revenueTotal: product.revenueTotal + sale.revenue,
              profitTotal: product.profitTotal + sale.profit,
            };
          });

          // 5. Money: profit, running costs, savings interest.
          const overhead = BALANCE.dailyOverhead;
          const interest = Math.round(state.savings * dailySavingsRate() * 100) / 100;
          const savings = Math.round((state.savings + interest) * 100) / 100;
          const cash = Math.round(state.cash + playerProfit - overhead);

          const ledgerEntry: LedgerDay = {
            day,
            revenue: Math.round(playerRevenue),
            manufacturingCost: Math.round(playerManufacturing),
            overhead,
            interest,
            netProfit: Math.round(playerProfit - overhead + interest),
            units: playerUnits,
          };

          return {
            day,
            news,
            rivals,
            products,
            cash,
            savings,
            lifetimeRevenue: state.lifetimeRevenue + playerRevenue,
            ledger: [...state.ledger, ledgerEntry].slice(-60),
          };
        }),

      /**
       * Feeds real elapsed time into the day counter. Speed only changes how
       * fast dayProgressMs fills from here on — it's never reset, so switching
       * between Pause/1x/2x/3x never throws away part of a day you'd already
       * banked. Capped to a handful of days per call so a backgrounded tab
       * coming back to life doesn't suddenly simulate a huge time skip.
       */
      advanceClock: (realDeltaMs) => {
        const state = get();
        if (state.speed === 0) return;

        let progressMs = state.dayProgressMs + realDeltaMs * state.speed;
        let daysToProcess = 0;
        while (progressMs >= BALANCE.dayLengthMs) {
          progressMs -= BALANCE.dayLengthMs;
          daysToProcess += 1;
        }

        for (let i = 0; i < Math.min(daysToProcess, 30); i++) {
          get().tick();
        }
        set({ dayProgressMs: progressMs });
      },

      stepDraftPart: (componentId, direction) =>
        set((state) => {
          const def = getComponent(componentId);
          const current = state.draft.parts[componentId];
          const next = clamp(current + direction, 0, def.tiers.length - 1);

          // Locked tiers can't be selected yet.
          if (next !== current && !isTierUnlocked(componentId, next, state.lifetimeRevenue)) {
            return state;
          }

          const parts = { ...state.draft.parts, [componentId]: next };
          const quality = computeQuality(parts);
          const unitCost = computeUnitCost(parts);

          return {
            draft: {
              ...state.draft,
              parts,
              // Keep nudging the asking price until the player sets one by hand.
              price: suggestedPrice(quality, unitCost),
            },
          };
        }),

      setDraftName: (name) =>
        set((state) => ({ draft: { ...state.draft, name: name.slice(0, 24), nameTouched: true } })),

      stepDraftPrice: (delta) =>
        set((state) => ({
          draft: { ...state.draft, price: clamp(state.draft.price + delta, 1, 9999) },
        })),

      setDraftPrice: (price) =>
        set((state) => ({ draft: { ...state.draft, price: clamp(Math.round(price), 1, 9999) } })),

      stepDraftUnits: (delta) =>
        set((state) => ({
          draft: {
            ...state.draft,
            unitsToManufacture: clamp(
              state.draft.unitsToManufacture + delta,
              BALANCE.minBatchSize,
              BALANCE.maxBatchSize,
            ),
          },
        })),

      resetDraft: () => set({ draft: freshDraft() }),

      launchProduct: () => {
        const state = get();
        const { draft } = state;
        const name = draft.name.trim();

        if (name.length === 0) {
          return { ok: false, message: 'Give your phone a name first.' };
        }

        const quality = computeQuality(draft.parts);
        const unitCost = computeUnitCost(draft.parts);
        const tooling = toolingCost(unitCost);

        // Manufacturing the batch is charged at today's cost — if a news event
        // has parts more expensive right now, building this batch costs more.
        const { costMult } = activeModifiers(state.news);
        const manufacturingCost = Math.round(unitCost * costMult * draft.unitsToManufacture);
        const totalUpfront = tooling + manufacturingCost;

        if (state.cash < totalUpfront) {
          return {
            ok: false,
            message: `You need $${totalUpfront.toLocaleString()} in cash to tool up and build this batch.`,
          };
        }

        const product: Product = {
          id: `player-${Date.now()}`,
          name,
          ownerId: 'player',
          parts: { ...draft.parts },
          quality,
          unitCost,
          price: draft.price,
          launchedOnDay: state.day,
          unitsInStock: draft.unitsToManufacture,
          unitsSoldTotal: 0,
          revenueTotal: 0,
          // Starts negative: the tooling + manufacturing spend hasn't been
          // earned back yet. Each day's sale revenue closes the gap.
          profitTotal: -totalUpfront,
          history: [],
        };

        set({
          products: [...state.products, product],
          cash: state.cash - totalUpfront,
          draft: freshDraft(),
        });

        return {
          ok: true,
          message: `${name} is on sale. Spent $${totalUpfront.toLocaleString()} on ${draft.unitsToManufacture.toLocaleString()} units.`,
        };
      },

      setProductPrice: (productId, price) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, price: clamp(Math.round(price), 1, 9999) } : p,
          ),
        })),

      discontinueProduct: (productId) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== productId) })),

      deposit: (amount) =>
        set((state) => {
          const value = Math.min(Math.max(0, Math.round(amount)), Math.max(0, state.cash));
          if (value <= 0) return state;
          return { cash: state.cash - value, savings: state.savings + value };
        }),

      withdraw: (amount) =>
        set((state) => {
          const value = Math.min(Math.max(0, Math.round(amount)), Math.max(0, state.savings));
          if (value <= 0) return state;
          return { cash: state.cash + value, savings: state.savings - value };
        }),

      resetGame: () => set({ ...initialState() }),
    }),
    {
      name: 'techtycoon-save-v1',
      // `version` lets us throw away old saves if the shape ever changes.
      version: 1,
    },
  ),
);

// ── Small selectors used across screens ────────────────────────────────────

export function selectPlayerProducts(state: GameState): Product[] {
  return state.products.filter((p) => p.ownerId === 'player');
}

export function selectRivalProducts(state: GameState): Product[] {
  return state.products.filter((p) => p.ownerId !== 'player');
}

/** Display name for whoever owns a product. */
export function ownerName(rivals: Rival[], ownerId: string): string {
  if (ownerId === 'player') return 'You';
  return rivals.find((r) => r.id === ownerId)?.name ?? 'Unknown';
}

/** Units a product sold on the most recent day (0 if it hasn't sold yet). */
export function unitsToday(product: Product): number {
  return product.history.at(-1)?.units ?? 0;
}
