# TechTycoon.io

A small tycoon game where you run a phone company: design a phone, pick a
price, launch it, and watch the days tick by while it sells against two rival
companies. It's built as a mobile-shaped web app, so it works well on a phone
browser and sits in a phone-sized frame on a laptop.

Everything runs in the browser. There is no backend and no account — your
company is saved in the browser's local storage.

## Running it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

To try it on your phone, make sure the phone is on the same Wi-Fi and open the
"Network" URL that `npm run dev` prints.

Other commands:

```bash
npm run build     # type-check and build into dist/
npm run preview   # serve the built version
```

## What's in v1

- **Design flow** in three stages: Hardware (processor, display, battery,
  camera) → Design (build material and the product name) → Pricing.
  Each part is a stepper row: arrows to change the tier, a bar showing how good
  that choice is, and the cost per unit.
- **Pricing screen** with a Budget / Mid-range / Premium bar showing where the
  market currently sits, what the rivals charge, a price stepper
  (−100/−10/−1 and +1/+10/+100) and a live profit-per-unit readout.
- **Real-time clock.** One in-game day takes 10 seconds. Pause, play, 2x and 3x
  all work; pausing stops the clock completely.
- **Daily sales.** Every day each phone on the market sells units based on how
  good it is for the price. Money lands in your cash balance, minus what the
  units cost to build and a fixed daily running cost.
- **Two AI rivals** that price their phones, drift those prices, and release a
  new model every couple of months.
- **Random news events** (battery shortages, holiday rushes, tariffs) that push
  component costs or demand around for a few days.
- **Market screen** comparing your phones and the rivals' side by side.
- **Finance screen** with a savings account at 4% APY compounded daily, and a
  summary of the last seven days.
- **Part unlocks.** The best tiers unlock as your lifetime revenue grows.
- Starting cash is $50,000.

Laptops and desktop PCs appear in the Design screen as locked product lines —
they're placeholders for later, not part of v1.

## Where things live

```
src/
  game/        game rules, no React in here
    components.ts   the parts catalogue (cost, quality, unlock thresholds)
    economy.ts      quality/cost maths and the daily sales formula
    news.ts         random events
    rivals.ts       the AI companies
  store/       zustand state (gameStore.ts holds the save + the day tick)
  screens/     one file per tab, plus screens/design for the three stages
  components/  shared UI pieces (steppers, sparklines, nav, buttons)
  hooks/       the real-time clock
  types/       shared TypeScript types
```

## Tweaking the game

Nearly all the balance numbers are in one object, `BALANCE` at the top of
`src/game/economy.ts` — market size, how much quality and price matter, running
costs, the random wobble in daily sales, and so on. The sales formula itself is
`simulateDay` in the same file, and it's commented step by step.

Part costs, quality values and unlock thresholds live in
`src/game/components.ts`.

## Built with

Vite, React, TypeScript, Tailwind CSS, Zustand (with localStorage persistence),
Framer Motion and lucide-react icons.
