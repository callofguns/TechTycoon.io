import type { NewsEvent } from '../types';
import { dateForDay, isSameCalendarDay, parseISODate } from './calendar';

/**
 * Real tech-industry history. Every entry here actually happened on the date
 * given — nothing in this list is randomly generated. Each fires automatically
 * once the game's calendar (see calendar.ts) reaches that date, nudging costs
 * or demand for a while, the same way the old random events used to. Add more
 * entries any time — they just need a real date and something true to say.
 */
interface HistoricalEvent {
  date: string; // "YYYY-MM-DD"
  headline: string;
  body: string;
  kind: NewsEvent['kind'];
  /** Multiplier applied while the event is live. 1 = flavor only, no gameplay effect. */
  multiplier: number;
  /** How many days the effect lasts. */
  days: number;
}

const TIMELINE: HistoricalEvent[] = [
  {
    date: '2007-06-29',
    headline: 'The first iPhone goes on sale',
    body: "Apple's iPhone launches today — the smartphone era, and your company, both begin.",
    kind: 'demand',
    multiplier: 1,
    days: 0,
  },
  {
    date: '2007-11-05',
    headline: 'Google unveils Android',
    body: 'A free, open mobile operating system just entered the race. More competition is coming.',
    kind: 'demand',
    multiplier: 1,
    days: 0,
  },
  {
    date: '2008-07-10',
    headline: 'The App Store opens',
    body: 'Apps become a real selling point overnight. Demand for capable phones +12%.',
    kind: 'demand',
    multiplier: 1.12,
    days: 14,
  },
  {
    date: '2008-09-15',
    headline: 'Lehman Brothers collapses',
    body: 'A global financial crisis is unfolding. Households are cutting back hard — demand −25%.',
    kind: 'demand',
    multiplier: 0.75,
    days: 60,
  },
  {
    date: '2010-01-13',
    headline: 'China tightens rare-earth exports',
    body: 'Materials used in screens and cameras just got scarcer and pricier. Costs +20%.',
    kind: 'cost',
    multiplier: 1.2,
    days: 30,
  },
  {
    date: '2010-06-24',
    headline: '"Antennagate" makes headlines',
    body: 'A widely-reported signal-strength controversy is spooking phone buyers. Demand −10%.',
    kind: 'demand',
    multiplier: 0.9,
    days: 10,
  },
  {
    date: '2011-03-11',
    headline: 'Earthquake and tsunami strike Japan',
    body: 'A major disaster has crippled Japanese electronics factories. Component costs +30%.',
    kind: 'cost',
    multiplier: 1.3,
    days: 45,
  },
  {
    date: '2011-10-05',
    headline: 'Steve Jobs has died',
    body: "Apple's co-founder, and the person who arguably invented the phone you're building, is gone at 56.",
    kind: 'demand',
    multiplier: 1,
    days: 0,
  },
  {
    date: '2012-10-29',
    headline: 'Hurricane Sandy shuts down East Coast ports',
    body: 'Shipping is backed up for weeks. Component costs +12%.',
    kind: 'cost',
    multiplier: 1.12,
    days: 14,
  },
  {
    date: '2016-08-02',
    headline: 'Galaxy Note7 batteries are catching fire',
    body: "Samsung's recall has every phone maker re-checking battery suppliers. Costs +15%.",
    kind: 'cost',
    multiplier: 1.15,
    days: 21,
  },
  {
    date: '2018-07-06',
    headline: 'US-China trade war tariffs begin',
    body: 'New tariffs are hitting imported electronics components. Costs +18%.',
    kind: 'cost',
    multiplier: 1.18,
    days: 90,
  },
  {
    date: '2019-05-16',
    headline: 'US restricts chip sales to Huawei',
    body: 'Export controls are rattling the whole chip supply chain. Costs +10%.',
    kind: 'cost',
    multiplier: 1.1,
    days: 30,
  },
  {
    date: '2020-03-11',
    headline: 'WHO declares COVID-19 a pandemic',
    body: 'Lockdowns are spreading worldwide and retail has stalled. Demand −20%.',
    kind: 'demand',
    multiplier: 0.8,
    days: 45,
  },
  {
    date: '2020-06-01',
    headline: 'Remote work fuels a device-buying boom',
    body: 'Millions of people stuck at home are upgrading their tech. Demand +25%.',
    kind: 'demand',
    multiplier: 1.25,
    days: 40,
  },
  {
    date: '2021-01-04',
    headline: 'The global chip shortage deepens',
    body: 'Semiconductor supply cannot keep up with demand anywhere in the world. Costs +25%.',
    kind: 'cost',
    multiplier: 1.25,
    days: 60,
  },
  {
    date: '2022-02-24',
    headline: 'Russia invades Ukraine',
    body: "Ukraine supplies much of the world's neon gas used in chip production. Costs +15%.",
    kind: 'cost',
    multiplier: 1.15,
    days: 30,
  },
  {
    date: '2023-03-10',
    headline: 'Silicon Valley Bank collapses',
    body: 'Tech funding is tightening fast and buyers have turned cautious. Demand −8%.',
    kind: 'demand',
    multiplier: 0.92,
    days: 20,
  },
];

// Parse each date once up front instead of on every single day tick.
const PARSED_TIMELINE = TIMELINE.map((event) => ({ ...event, parsedDate: parseISODate(event.date) }));

/** Any real event(s) landing exactly on this game day, ready to drop into the news feed. */
export function historicalEventsForDay(day: number): NewsEvent[] {
  const today = dateForDay(day);
  return PARSED_TIMELINE.filter((event) => isSameCalendarDay(event.parsedDate, today)).map((event) => ({
    id: `history-${event.date}`,
    day,
    headline: event.headline,
    body: event.body,
    kind: event.kind,
    multiplier: event.multiplier,
    daysRemaining: event.days,
  }));
}

/**
 * Combine every still-active event into two multipliers the day tick uses.
 * Multipliers stack by multiplication, so two +15% events become +32%.
 */
export function activeModifiers(news: NewsEvent[]): { costMult: number; demandMult: number } {
  let costMult = 1;
  let demandMult = 1;
  for (const event of news) {
    if (event.daysRemaining <= 0) continue;
    if (event.kind === 'cost') costMult *= event.multiplier;
    else demandMult *= event.multiplier;
  }
  return { costMult, demandMult };
}
