/** Formatting helpers, kept in one place so numbers look the same everywhere. */

/** $1,234 — no cents, which is what most screens want. */
export function money(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`;
}

/** $1.2k / $3.4M — for tight spaces like card headers. */
export function moneyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}$${Math.round(abs)}`;
}

/** 1,234 */
export function count(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/** Day 12 → "Day 12" (kept as a helper in case we add weeks/quarters later). */
export function dayLabel(day: number): string {
  return `Day ${day}`;
}
