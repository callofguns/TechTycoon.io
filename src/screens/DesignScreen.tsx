import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, DollarSign, Laptop, Lock, Monitor, Package, Palette, Pause, Smartphone } from 'lucide-react';
import { Screen } from '../components/Screen';
import { HardwareStage } from './design/HardwareStage';
import { BrandingStage } from './design/BrandingStage';
import { PricingStage } from './design/PricingStage';
import { ProductionStage } from './design/ProductionStage';
import { useGameStore } from '../store/gameStore';
import { useToastStore } from '../store/toastStore';

type StageId = 'hardware' | 'branding' | 'pricing' | 'production';

const STAGES: { id: StageId; label: string; icon: typeof Cpu }[] = [
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'branding', label: 'Design', icon: Palette },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'production', label: 'Production', icon: Package },
];

/** Product lines. Only phones are playable in v1 — the rest are locked stubs. */
const PRODUCT_TYPES = [
  { id: 'phone', label: 'Phone', icon: Smartphone, locked: false },
  { id: 'laptop', label: 'Laptop', icon: Laptop, locked: true },
  { id: 'desktop', label: 'Desktop PC', icon: Monitor, locked: true },
];

export function DesignScreen() {
  const [stage, setStage] = useState<StageId>('hardware');
  const launchProduct = useGameStore((s) => s.launchProduct);
  const setTab = useGameStore((s) => s.setTab);
  const showToast = useToastStore((s) => s.show);

  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  function handleLaunch() {
    const result = launchProduct();
    showToast(result.message);

    if (result.ok) {
      setStage('hardware'); // the draft is reset, ready for the next design
      // Let the confirmation land, then show the new phone on Home.
      window.setTimeout(() => setTab('home'), 1100);
    }
  }

  return (
    <Screen>
      {/* The clock is suspended for as long as this tab is open — see useGameClock. */}
      <div className="flex items-center gap-1.5 self-start rounded-pill bg-white/[0.05] px-2.5 py-1">
        <Pause size={11} strokeWidth={2.6} fill="currentColor" className="text-white/40" />
        <span className="text-[10.5px] font-semibold text-white/40">Clock paused while you design</span>
      </div>

      {/* Product line picker — phones now, PCs later */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        {PRODUCT_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <motion.button
              key={type.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              onClick={() => type.locked && showToast(`${type.label}s are coming soon.`)}
              className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-2 text-[12px] font-semibold ${
                type.locked
                  ? 'border-white/[0.06] bg-white/[0.02] text-white/25'
                  : 'border-accent/40 bg-accent/15 text-accent-soft'
              }`}
            >
              <Icon size={14} strokeWidth={2.4} />
              {type.label}
              {type.locked && <Lock size={11} strokeWidth={2.6} />}
            </motion.button>
          );
        })}
      </div>

      {/* Stage tabs: Hardware -> Design -> Pricing */}
      <div className="card flex items-center justify-between px-2 py-2.5">
        {STAGES.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.id === stage;
          const isAhead = index > stageIndex;

          return (
            <div key={item.id} className="flex flex-1 items-center">
              <motion.button
                type="button"
                onClick={() => setStage(item.id)}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="stage-dot"
                      className="absolute inset-0 rounded-full bg-accent shadow-glow"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-full border border-white/[0.07] bg-ink-600" />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={2.3}
                    className={`relative z-10 ${
                      isActive ? 'text-white' : isAhead ? 'text-white/25' : 'text-white/55'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10.5px] font-semibold ${
                    isActive ? 'text-accent-soft' : isAhead ? 'text-white/25' : 'text-white/45'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>

              {index < STAGES.length - 1 && (
                <div
                  className={`mb-5 h-[2px] w-4 rounded-full ${
                    index < stageIndex ? 'bg-accent/60' : 'bg-white/[0.08]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* The stage itself — keyed so each one springs in when selected */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      >
        {stage === 'hardware' && <HardwareStage />}
        {stage === 'branding' && <BrandingStage />}
        {stage === 'pricing' && <PricingStage />}
        {stage === 'production' && <ProductionStage onLaunch={handleLaunch} />}
      </motion.div>

      {/* Move to the next stage */}
      {stage !== 'production' && (
        <motion.button
          type="button"
          onClick={() => setStage(STAGES[stageIndex + 1].id)}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className="mt-1 flex h-[52px] w-full items-center justify-center rounded-pill bg-accent text-[15px] font-semibold text-white shadow-glow"
        >
          Next: {STAGES[stageIndex + 1].label}
        </motion.button>
      )}

    </Screen>
  );
}
