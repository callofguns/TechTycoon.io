import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Screen, SectionTitle } from '../components/Screen';
import { Sparkline } from '../components/Sparkline';
import { PriceTierBar } from '../components/PriceTierBar';
import { count, money } from '../lib/format';
import { priceTierShares } from '../game/economy';
import { ownerName, unitsToday, useGameStore } from '../store/gameStore';
import { useProductDetailStore } from '../store/productDetailStore';
import type { Product } from '../types';

/** Every phone on sale, yours and the competition's, side by side. */
export function MarketScreen() {
  const products = useGameStore((s) => s.products);
  const day = useGameStore((s) => s.day);
  const rivals = useGameStore((s) => s.rivals);
  const discontinueProduct = useGameStore((s) => s.discontinueProduct);

  const sorted = [...products].sort((a, b) => unitsToday(b) - unitsToday(a));
  const totalToday = sorted.reduce((sum, p) => sum + unitsToday(p), 0);
  const yourToday = sorted
    .filter((p) => p.ownerId === 'player')
    .reduce((sum, p) => sum + unitsToday(p), 0);
  const yourShare = totalToday > 0 ? Math.round((yourToday / totalToday) * 100) : 0;

  // Use the cheapest phone on the market to highlight a bracket in the bar.
  const referencePrice = sorted.length > 0 ? sorted[0].price : 500;

  return (
    <Screen>
      <div className="card px-4 py-3.5">
        <div className="flex items-end justify-between">
          <div>
            <div className="label-dim">Your market share</div>
            <div className="tnum mt-1 text-[26px] font-bold leading-none text-white">
              {yourShare}%
            </div>
          </div>
          <div className="text-right">
            <div className="label-dim">Units sold today</div>
            <div className="tnum mt-1 text-[16px] font-bold leading-none text-white/85">
              {count(yourToday)} / {count(totalToday)}
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <PriceTierBar shares={priceTierShares(products, day)} currentPrice={referencePrice} />
        </div>
      </div>

      <SectionTitle right={<span className="text-[11px] text-white/30">{sorted.length} phones</span>}>
        On sale now
      </SectionTitle>

      <div className="flex flex-col gap-2">
        {sorted.map((product) => (
          <MarketRow
            key={product.id}
            product={product}
            owner={ownerName(rivals, product.ownerId)}
            onDiscontinue={
              product.ownerId === 'player' ? () => discontinueProduct(product.id) : undefined
            }
          />
        ))}
      </div>

      <p className="px-1 pt-1 text-[11.5px] leading-snug text-white/30">
        Rivals refresh their line-up every couple of months, so a phone that leads today will not
        lead forever.
      </p>
    </Screen>
  );
}

function MarketRow({
  product,
  owner,
  onDiscontinue,
}: {
  product: Product;
  owner: string;
  onDiscontinue?: () => void;
}) {
  const isPlayer = product.ownerId === 'player';
  const soldOut = isPlayer && product.unitsInStock <= 0;
  const openDetail = useProductDetailStore((s) => s.open);

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={() => openDetail(product.id)}
      className={`card cursor-pointer px-3.5 py-3 ${isPlayer ? 'border-accent/25' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[14px] font-bold text-white">{product.name}</h3>
            {isPlayer && (
              <span className="rounded-pill bg-accent/15 px-1.5 py-0.5 text-[9.5px] font-bold text-accent-soft">
                YOURS
              </span>
            )}
            {soldOut && (
              <span className="rounded-pill bg-red-400/15 px-1.5 py-0.5 text-[9.5px] font-bold text-red-300">
                SOLD OUT
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-white/35">{owner}</div>
        </div>

        <Sparkline
          history={product.history}
          metric="units"
          className="h-7 w-[70px] shrink-0"
          color={isPlayer ? '#5b7fff' : '#7a7a8c'}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
        <Stat label="Price" value={money(product.price)} />
        <Stat label="Quality" value={`Q${product.quality}`} />
        <Stat label="Today" value={count(unitsToday(product))} />
        {isPlayer ? (
          <Stat
            label="Profit"
            value={money(product.profitTotal)}
            tone={product.profitTotal >= 0 ? 'good' : 'bad'}
          />
        ) : (
          <Stat label="Total" value={count(product.unitsSoldTotal)} />
        )}

        {onDiscontinue && (
          <motion.button
            type="button"
            aria-label="Discontinue"
            onClick={(event) => {
              event.stopPropagation();
              onDiscontinue();
            }}
            whileTap={{ scale: 0.86 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-ink-600 text-white/40 active:bg-ink-500"
          >
            <Trash2 size={13} strokeWidth={2.2} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'bad';
}) {
  const color =
    tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white/85';
  return (
    <div className="min-w-0 flex-1">
      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-white/30">{label}</div>
      <div className={`tnum mt-0.5 text-[13px] font-bold ${color}`}>{value}</div>
    </div>
  );
}
