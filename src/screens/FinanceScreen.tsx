import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-react';
import { Screen, SectionTitle } from '../components/Screen';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { count, money } from '../lib/format';
import { BALANCE, dailySavingsRate } from '../game/economy';
import { selectPlayerProducts, unitsToday, useGameStore } from '../store/gameStore';

/** Cash, today's trading numbers, a simple savings account, and a 7-day summary. */
export function FinanceScreen() {
  const cash = useGameStore((s) => s.cash);
  const savings = useGameStore((s) => s.savings);
  const lifetimeRevenue = useGameStore((s) => s.lifetimeRevenue);
  const ledger = useGameStore((s) => s.ledger);
  const deposit = useGameStore((s) => s.deposit);
  const withdraw = useGameStore((s) => s.withdraw);
  const products = useGameStore(selectPlayerProducts);

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');

  const today = ledger.at(-1);
  const unitsSoldToday = products.reduce((sum, p) => sum + unitsToday(p), 0);
  const week = ledger.slice(-7);
  const weekTotals = week.reduce(
    (totals, dayRow) => ({
      revenue: totals.revenue + dayRow.revenue,
      manufacturing: totals.manufacturing + dayRow.manufacturingCost,
      overhead: totals.overhead + dayRow.overhead,
      interest: totals.interest + dayRow.interest,
      net: totals.net + dayRow.netProfit,
    }),
    { revenue: 0, manufacturing: 0, overhead: 0, interest: 0, net: 0 },
  );

  const dailyInterest = savings * dailySavingsRate();
  const available = mode === 'deposit' ? cash : savings;
  const amounts = [1_000, 5_000, 25_000];

  function apply(amount: number) {
    if (mode === 'deposit') deposit(amount);
    else withdraw(amount);
  }

  return (
    <Screen>
      <SectionTitle>Today</SectionTitle>
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

      <div className="card px-4 py-4">
        <div className="label-dim">Cash on hand</div>
        <AnimatedNumber
          value={cash}
          format={money}
          className={`tnum mt-1.5 block text-[32px] font-bold leading-none ${
            cash < 0 ? 'text-red-400' : 'text-white'
          }`}
        />
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[12px]">
          <span className="text-white/40">Lifetime revenue</span>
          <span className="tnum font-semibold text-white/75">{money(lifetimeRevenue)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[12px]">
          <span className="text-white/40">Daily running costs</span>
          <span className="tnum font-semibold text-white/75">-{money(BALANCE.dailyOverhead)}</span>
        </div>
      </div>

      <SectionTitle>Savings</SectionTitle>
      <div className="card px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
            <PiggyBank size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <AnimatedNumber
              value={savings}
              format={money}
              className="tnum block text-[22px] font-bold leading-none text-white"
            />
            <div className="mt-1 text-[11.5px] text-white/40">
              {(BALANCE.savingsApy * 100).toFixed(0)}% APY · +{money(dailyInterest)} a day
            </div>
          </div>
        </div>

        {/* Deposit / withdraw toggle */}
        <div className="mt-3.5 flex gap-1.5 rounded-pill border border-white/[0.07] bg-ink-600 p-1">
          {(['deposit', 'withdraw'] as const).map((option) => {
            const isActive = mode === option;
            return (
              <motion.button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                className="relative flex h-9 flex-1 items-center justify-center rounded-pill"
              >
                {isActive && (
                  <motion.div
                    layoutId="savings-pill"
                    className="absolute inset-0 rounded-pill bg-accent"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 text-[12.5px] font-semibold capitalize ${
                    isActive ? 'text-white' : 'text-white/45'
                  }`}
                >
                  {option === 'deposit' ? (
                    <ArrowDownLeft size={14} strokeWidth={2.6} />
                  ) : (
                    <ArrowUpRight size={14} strokeWidth={2.6} />
                  )}
                  {option}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          {amounts.map((amount) => (
            <AmountButton
              key={amount}
              label={money(amount)}
              disabled={available < amount}
              onPress={() => apply(amount)}
            />
          ))}
          <AmountButton
            label="All"
            disabled={available <= 0}
            onPress={() => apply(Math.max(0, available))}
          />
        </div>
      </div>

      <SectionTitle right={<span className="text-[11px] text-white/30">{week.length} days</span>}>
        Last 7 days
      </SectionTitle>
      <div className="card px-4 py-3">
        {week.length === 0 ? (
          <p className="py-2 text-[12.5px] text-white/40">
            No trading days recorded yet. Press play and let a day tick by.
          </p>
        ) : (
          <>
            <LedgerRow label="Revenue" value={weekTotals.revenue} tone="good" />
            <LedgerRow label="Manufacturing" value={-weekTotals.manufacturing} />
            <LedgerRow label="Running costs" value={-weekTotals.overhead} />
            <LedgerRow label="Savings interest" value={weekTotals.interest} tone="good" />
            <div className="mt-1.5 border-t border-white/[0.06] pt-2">
              <LedgerRow
                label="Net profit"
                value={weekTotals.net}
                tone={weekTotals.net >= 0 ? 'good' : 'bad'}
                bold
              />
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}

function AmountButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onPress()}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      className={`tnum h-11 flex-1 rounded-2xl border text-[12.5px] font-semibold ${
        disabled
          ? 'border-white/[0.04] bg-white/[0.02] text-white/20'
          : 'border-white/[0.08] bg-ink-600 text-white/80 active:bg-ink-500'
      }`}
    >
      {label}
    </motion.button>
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

function LedgerRow({
  label,
  value,
  tone = 'neutral',
  bold = false,
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'good' | 'bad';
  bold?: boolean;
}) {
  const color = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-white/80';
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-[12.5px] ${bold ? 'font-semibold text-white/70' : 'text-white/40'}`}>
        {label}
      </span>
      <span className={`tnum text-[13.5px] font-bold ${color}`}>{money(value)}</span>
    </div>
  );
}
