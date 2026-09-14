import { AnimatePresence, motion } from 'framer-motion';
import { Newspaper, TrendingDown, TrendingUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { dateForDay } from '../game/calendar';
import { formatDateShort } from '../lib/format';

/** The little news strip on Home: latest headline plus the two before it. */
export function NewsFeed() {
  const news = useGameStore((s) => s.news);

  if (news.length === 0) {
    return (
      <div className="card flex items-center gap-3 px-4 py-3">
        <Newspaper size={16} className="shrink-0 text-white/30" />
        <p className="text-[12.5px] text-white/40">
          No news yet. Market reports will show up here as days pass.
        </p>
      </div>
    );
  }

  const [latest, ...older] = news;
  // Pure-flavor headlines (multiplier 1, e.g. "Steve Jobs has died") aren't
  // good or bad news for the business, so they get a neutral treatment.
  const isFlavor = latest.multiplier === 1;
  const isGood = !isFlavor && (latest.kind === 'demand' ? latest.multiplier >= 1 : latest.multiplier <= 1);

  return (
    <div className="card overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={latest.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="flex gap-3 px-4 py-3"
        >
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              isFlavor
                ? 'bg-white/[0.06] text-white/40'
                : isGood
                  ? 'bg-emerald-400/10 text-emerald-300'
                  : 'bg-amber-400/10 text-amber-300'
            }`}
          >
            {isFlavor ? (
              <Newspaper size={14} />
            ) : isGood ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white">{latest.headline}</span>
              {latest.daysRemaining > 0 && (
                <span className="rounded-pill bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-semibold text-white/50">
                  {latest.daysRemaining}d left
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-white/45">{latest.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {older.length > 0 && (
        <div className="border-t border-white/[0.06] px-4 py-2">
          {older.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-baseline gap-2 py-0.5">
              <span className="tnum shrink-0 text-[10px] font-semibold text-white/25">
                {formatDateShort(dateForDay(item.day))}
              </span>
              <span className="truncate text-[11.5px] text-white/35">{item.headline}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
