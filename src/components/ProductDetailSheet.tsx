import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { useGameStore, ownerName } from '../store/gameStore';
import { rivalColor } from '../game/rivals';
import { useProductDetailStore } from '../store/productDetailStore';
import { Sparkline } from './Sparkline';
import { QualityBar } from './QualityBar';
import { COMPONENTS } from '../game/components';
import { COMPONENT_COLORS } from '../lib/componentColors';
import { dateForDay } from '../game/calendar';
import { formatDate, money, count } from '../lib/format';
import { profitPerUnit } from '../game/economy';
import { activeModifiers } from '../game/news';

/**
 * Full-detail bottom sheet for one product — opened by tapping a phone on
 * Home or Market. Read-only: it's for looking at the device, not editing it
 * (price/discontinue controls stay where they already were).
 */
export function ProductDetailSheet() {
  const productId = useProductDetailStore((s) => s.productId);
  const close = useProductDetailStore((s) => s.close);
  const products = useGameStore((s) => s.products);
  const rivals = useGameStore((s) => s.rivals);
  const day = useGameStore((s) => s.day);
  const news = useGameStore((s) => s.news);

  const discontinueProduct = useGameStore((s) => s.discontinueProduct);

  const product = products.find((p) => p.id === productId) ?? null;
  const isPlayer = product?.ownerId === 'player';
  const soldOut = (product?.unitsInStock ?? 1) <= 0;
  const { costMult } = activeModifiers(news);

  // Only the handle + header can start a drag, so swiping inside the
  // scrollable stats/component list below still scrolls instead of dragging
  // the whole sheet around.
  const dragControls = useDragControls();

  function handleDragEnd(_event: unknown, info: PanInfo) {
    // A firm downward flick or dragging it more than a third of the way
    // closed both count as "let go of this".
    if (info.offset.y > 140 || info.velocity.y > 700) close();
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key={product.id}
          className="absolute inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={handleDragEnd}
            onClick={(event) => event.stopPropagation()}
            className="no-scrollbar max-h-[86%] w-full overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-white/10 bg-ink-800 pb-[calc(env(safe-area-inset-bottom)+20px)]"
          >
            {/* Swipe down from here to dismiss — the stats/component list below stays scrollable. */}
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="cursor-grab touch-none pb-1 pt-2.5 active:cursor-grabbing"
            >
              <div className="mx-auto h-1 w-10 rounded-pill bg-white/15" />

              <div className="flex items-start justify-between gap-3 px-5 pt-2.5">
                <div className="min-w-0">
                  <h2 className="truncate text-[19px] font-bold leading-tight text-white">
                    {product.name}
                  </h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent-soft">
                      Q{product.quality}
                    </span>
                    {product.unitsInStock <= 0 && (
                      <span className="rounded-pill bg-red-400/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                        SOLD OUT
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[11.5px] text-white/40">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: isPlayer ? '#5b7fff' : rivalColor(product.ownerId),
                        }}
                      />
                      {ownerName(rivals, product.ownerId)}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  onPointerDown={(event) => event.stopPropagation()}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-ink-600 text-white/60 active:bg-ink-500"
                >
                  <X size={16} strokeWidth={2.4} />
                </motion.button>
              </div>
            </div>

            <div className="mt-3 px-5">
              <Sparkline history={product.history} metric="revenue" className="h-16 w-full" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 px-5">
              <Stat label="Price" value={money(product.price)} />
              <Stat
                label="Profit / unit"
                value={money(profitPerUnit(product.price, product.unitCost, costMult))}
              />
              <Stat label="Units in stock" value={count(product.unitsInStock)} />
              <Stat label="Units sold total" value={count(product.unitsSoldTotal)} />
              <Stat label="Revenue total" value={money(product.revenueTotal)} />
              <Stat
                label="Total profit"
                value={money(product.profitTotal)}
                tone={product.profitTotal >= 0 ? 'good' : 'bad'}
              />
              <Stat label="Launched" value={formatDate(dateForDay(product.launchedOnDay))} />
              <Stat
                label="On sale"
                value={day === product.launchedOnDay ? 'Today' : `${day - product.launchedOnDay}d`}
              />
            </div>

            <div className="mt-4 px-5">
              <div className="label-dim px-1">Components</div>
              <div className="card mt-1.5 px-3 py-1">
                {COMPONENTS.map((def) => {
                  const tierIndex = product.parts[def.id];
                  const tier = def.tiers[tierIndex] ?? def.tiers[0];
                  return (
                    <div
                      key={def.id}
                      className="flex items-center gap-3 border-b border-white/[0.05] py-2.5 last:border-0"
                    >
                      <div className="w-[76px] shrink-0">
                        <div className="flex items-center gap-1.5 text-[12.5px] font-semibold leading-tight text-white/85">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${COMPONENT_COLORS[def.id].dot}`} />
                          {def.label}
                        </div>
                        <div className="mt-0.5 text-[10px] leading-tight text-white/35">{def.blurb}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-semibold text-white">{tier.name}</div>
                        <div className="tnum mt-0.5 text-[10.5px] text-white/40">
                          {money(tier.cost)} / unit
                        </div>
                      </div>
                      <QualityBar value={tier.quality} height={28} color={COMPONENT_COLORS[def.id].bar} />
                    </div>
                  );
                })}
              </div>
            </div>

            {isPlayer && soldOut && (
              <div className="mt-4 px-5">
                <motion.button
                  type="button"
                  onClick={() => discontinueProduct(product.id)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-pill border border-red-400/25 bg-red-400/10 text-[13px] font-semibold text-red-300 active:bg-red-400/20"
                >
                  <Trash2 size={15} strokeWidth={2.4} />
                  Remove this phone
                </motion.button>
              </div>
            )}

            {isPlayer === false && (
              <p className="mt-3 px-6 pb-1 text-center text-[11px] leading-snug text-white/25">
                A competitor's device — you can look, but only your own phones can be edited.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const color = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="card-inset px-3 py-2.5">
      <div className="label-dim truncate">{label}</div>
      <div className={`tnum mt-1 truncate text-[15px] font-bold leading-none ${color}`}>{value}</div>
    </div>
  );
}
