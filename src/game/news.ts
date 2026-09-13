import type { NewsEvent } from '../types';

/**
 * Random news events. Each one nudges either manufacturing costs or overall
 * demand for a few days, then expires. Add more entries here freely — one is
 * picked at random when an event fires.
 */
interface NewsTemplate {
  headline: string;
  body: string;
  kind: NewsEvent['kind'];
  multiplier: number;
  days: number;
}

const TEMPLATES: NewsTemplate[] = [
  {
    headline: 'Battery shortage',
    body: 'A supplier fire has squeezed cell supply. Component costs +15%.',
    kind: 'cost',
    multiplier: 1.15,
    days: 3,
  },
  {
    headline: 'Chip glut',
    body: 'Foundries overproduced this quarter. Component costs −12%.',
    kind: 'cost',
    multiplier: 0.88,
    days: 4,
  },
  {
    headline: 'Holiday rush',
    body: 'Shoppers are out in force. Phone demand +25%.',
    kind: 'demand',
    multiplier: 1.25,
    days: 5,
  },
  {
    headline: 'Economic slowdown',
    body: 'Households are cutting back. Phone demand −18%.',
    kind: 'demand',
    multiplier: 0.82,
    days: 4,
  },
  {
    headline: 'Shipping delays',
    body: 'Port congestion is driving up freight. Component costs +9%.',
    kind: 'cost',
    multiplier: 1.09,
    days: 3,
  },
  {
    headline: 'Viral review',
    body: 'A huge tech channel is talking about phones again. Demand +15%.',
    kind: 'demand',
    multiplier: 1.15,
    days: 3,
  },
  {
    headline: 'Rare-earth tariffs',
    body: 'New import duties hit camera and display parts. Costs +18%.',
    kind: 'cost',
    multiplier: 1.18,
    days: 5,
  },
  {
    headline: 'Trade-in scheme',
    body: 'Carriers launch aggressive trade-ins. Demand +20%.',
    kind: 'demand',
    multiplier: 1.2,
    days: 4,
  },
];

/** Build a live news event for the given day. */
export function rollNewsEvent(day: number, random: () => number = Math.random): NewsEvent {
  const template = TEMPLATES[Math.floor(random() * TEMPLATES.length)];
  return {
    id: `news-${day}-${Math.floor(random() * 100000)}`,
    day,
    headline: template.headline,
    body: template.body,
    kind: template.kind,
    multiplier: template.multiplier,
    daysRemaining: template.days,
  };
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
