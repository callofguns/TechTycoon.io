import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { AnimatedNumber } from './AnimatedNumber';
import { money, count } from '../lib/format';
import { profitPerUnit } from '../game/economy';
import { activeModifiers } from '../game/news';
import { unitsToday, useGameStore } from '../store/gameStore';
import { useProductDetailStore } from '../store/productDetailStore';
import type { Product } from '../types';

/** A card for one of the player's phones, with a mini sales chart and price controls. */
export function ProductCard({ product }: { product: Product }) {
  const news = useGameStore((s) => s.news);
  const day = useGameStore((s) => s.day);
  const setProductPrice = useGameStore((s) => s.setProductPrice);
  const discontinueProduct = useGameStore((s) => s.discontinueProduct);
  const openDetail = useProductDetailStore((s) => s.open);

  const { costMult } = activeModifiers(news);
  const margin = profitPerUnit(product.price, product.unitCost, costMult);
  const today = unitsToday(product);
  const revenueToday = product.history.at(-1)?.revenue ?? 0;
  const age = day - product.launchedOnDay;
  const soldOut = product.unitsInStock <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      onClick={() => openDetail(product.id)}
      className="card cursor-pointer overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold leading-tight text-white">{product.name}</h3>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-soft">
              Q{product.quality}
            </span>
            {soldOut && (
              <span className="rounded-pill bg-red-400/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                SOLD OUT
              </span>
            )}
            <span className="text-[11px] text-white/35">
              {age === 0 ? 'Launched today' : `${age}d on sale`}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="label-dim">Sold today</div>
          <AnimatedNumber
            value={today}
            format={count}
            className="tnum block text-[19px] font-bold leading-tight text-white"
          />
          <div className="tnum mt-0.5 text-[10px] text-white/35">{count(product.unitsInStock)} in stock</div>
        </div>
      </div>

      <div className="mt-2 px-4">
        <Sparkline history={product.history} metric="units" className="h-8 w-full" />
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2.5">
        {soldOut ? (
          <motion.button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              discontinueProduct(product.id);
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="flex h-10 items-center gap-1.5 rounded-pill border border-red-400/25 bg-red-400/10 px-3.5 text-[12px] font-semibold text-red-300 active:bg-red-400/20"
          >
            <Trash2 size={14} strokeWidth={2.4} />
            Remove
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
            <PriceNudge icon="minus" onPress={() => setProductPrice(product.id, product.price - 10)} />
            <div className="min-w-[64px] text-center">
              <div className="tnum text-[15px] font-bold leading-none text-white">
                {money(product.price)}
              </div>
              <div
                className={`tnum mt-0.5 text-[10px] font-semibold ${
                  margin > 0 ? 'text-emerald-400/80' : 'text-red-400/80'
                }`}
              >
                {margin > 0 ? '+' : ''}
                {money(margin)}/unit
              </div>
            </div>
            <PriceNudge icon="plus" onPress={() => setProductPrice(product.id, product.price + 10)} />
          </div>
        )}

        <div className="text-right">
          <div className="label-dim">Revenue today</div>
          <div className="tnum text-[13px] font-semibold text-white/80">{money(revenueToday)}</div>
          <div
            className={`tnum mt-0.5 text-[10px] font-semibold ${
              product.profitTotal >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'
            }`}
          >
            {money(product.profitTotal)} total
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PriceNudge({ icon, onPress }: { icon: 'plus' | 'minus'; onPress: () => void }) {
  const Icon = icon === 'plus' ? Plus : Minus;
  return (
    <motion.button
      type="button"
      aria-label={icon === 'plus' ? 'Raise price by 10' : 'Lower price by 10'}
      onClick={onPress}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-ink-600 text-white/70 active:bg-ink-500"
    >
      <Icon size={15} strokeWidth={2.6} />
    </motion.button>
  );
}
