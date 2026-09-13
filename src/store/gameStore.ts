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
import { activeModifiers, rollNewsEvent } from '../game/news';
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

  stepDraftPart: (componentId: ComponentId, direction: 1 | -1) => void;
  setDraftName: (name: string) => void;
  stepDraftPrice: (delta: number) => void;
  setDraftPrice: (price: number) => void;
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
    nameTouched: false,
  };
}

function initialState() {
  return {
    day: 1,
    cash: BALANCE.startingCash,
    savings: 0,
    lifetimeRevenue: 0,
    speed: 1 as Speed,
    products: createInitialRivalProducts(),
    rivals: RIVALS.map((r) => ({ ...r })),
    news: [] as NewsEvent[],
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

          // 2. Maybe a new headline.
          if (Math.random() < BALANCE.newsChancePerDay) {
            news = [rollNewsEvent(day), ...news].slice(0, 8);
          }

          const { costMult, demandMult } = activeModifiers(news);

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
          const sales = simulateDay(products, day, demandMult, costMult);
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

        if (state.cash < tooling) {
          return {
            ok: false,
            message: `You need $${tooling.toLocaleString()} in cash for factory tooling.`,
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
          unitsSoldTotal: 0,
          revenueTotal: 0,
          profitTotal: 0,
          history: [],
        };

        set({
          products: [...state.products, product],
          cash: state.cash - tooling,
          draft: freshDraft(),
        });

        return { ok: true, message: `${name} is on sale. Tooling cost $${tooling.toLocaleString()}.` };
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
