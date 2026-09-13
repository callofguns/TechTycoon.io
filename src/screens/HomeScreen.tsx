import { motion } from 'framer-motion';
import { PlusCircle, Smartphone } from 'lucide-react';
import { Screen, SectionTitle } from '../components/Screen';
import { NewsFeed } from '../components/NewsFeed';
import { ProductCard } from '../components/ProductCard';
import { PillButton } from '../components/PillButton';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { count, money } from '../lib/format';
import { selectPlayerProducts, unitsToday, useGameStore } from '../store/gameStore';

export function HomeScreen() {
  const products = useGameStore(selectPlayerProducts);
  const ledger = useGameStore((s) => s.ledger);
  const setTab = useGameStore((s) => s.setTab);

  const today = ledger.at(-1);
  const unitsSoldToday = products.reduce((sum, p) => sum + unitsToday(p), 0);

  return (
    <Screen>
      {/* Today's headline numbers */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Units today" value={unitsSoldToday} format={count} />
        <StatTile label="Revenue" value={today?.revenue ?? 0} format={money} />
        <StatTile
          label="Net profit"
          value={today?.netProfit ?? 0}
          format={money}
          tone={(today?.netProfit ?? 0) >= 0 ? 'good' : 'bad'}
        />
      </div>

      <SectionTitle>Market news</SectionTitle>
      <NewsFeed />

      <SectionTitle right={<span className="text-[11px] text-white/30">{products.length} live</span>}>
        Your phones
      </SectionTitle>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="card flex flex-col items-center gap-3 px-5 py-8 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Smartphone size={22} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white">No phones on sale</h3>
            <p className="mt-1 text-[12.5px] leading-snug text-white/40">
              Design your first phone, set a price, and start selling.
            </p>
          </div>
          <PillButton onClick={() => setTab('design')} className="mt-1">
            <PlusCircle size={17} strokeWidth={2.4} />
            Design a phone
          </PillButton>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          <PillButton variant="ghost" onClick={() => setTab('design')}>
            <PlusCircle size={17} strokeWidth={2.4} />
            Design another phone
          </PillButton>
        </div>
      )}
    </Screen>
  );
}

function StatTile({
  label,
  value,
  format,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  format: (value: number) => string;
  tone?: 'neutral' | 'good' | 'bad';
}) {
  const color =
    tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white';

  return (
    <div className="card px-3 py-2.5">
      <div className="label-dim truncate">{label}</div>
      <AnimatedNumber
        value={value}
        format={format}
        className={`tnum mt-1.5 block text-[15px] font-bold leading-none ${color}`}
      />
    </div>
  );
}
