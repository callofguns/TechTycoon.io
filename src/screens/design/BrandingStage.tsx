import { StepperRow } from '../../components/StepperRow';
import { DesignSummary } from '../../components/DesignSummary';
import { SectionTitle } from '../../components/Screen';
import { DESIGN_COMPONENT_IDS, getComponent, isTierUnlocked } from '../../game/components';
import { money } from '../../lib/format';
import { COMPONENT_COLORS } from '../../lib/componentColors';
import { useGameStore } from '../../store/gameStore';

/** Stage 2: name the phone and choose how it looks and feels. */
export function BrandingStage() {
  const draft = useGameStore((s) => s.draft);
  const unlockedTierIndex = useGameStore((s) => s.unlockedTierIndex);
  const stepDraftPart = useGameStore((s) => s.stepDraftPart);
  const setDraftName = useGameStore((s) => s.setDraftName);

  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>Product name</SectionTitle>
      <div className="card px-4 py-3">
        <input
          value={draft.name}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="e.g. Nova 1"
          maxLength={24}
          className="w-full bg-transparent text-[18px] font-bold text-white outline-none placeholder:text-white/20"
        />
        <div className="mt-1 flex justify-between text-[11px] text-white/25">
          <span>Shown on Home and in the market</span>
          <span className="tnum">{draft.name.length}/24</span>
        </div>
      </div>

      <SectionTitle>Finish</SectionTitle>
      <div className="card px-3 py-2">
        {DESIGN_COMPONENT_IDS.map((id) => {
          const def = getComponent(id);
          const index = draft.parts[id];
          const tier = def.tiers[index];
          const hasNext = index < def.tiers.length - 1;
          const nextUnlocked = hasNext && isTierUnlocked(id, index + 1, unlockedTierIndex);

          return (
            <StepperRow
              key={id}
              label={def.label}
              blurb={def.blurb}
              value={tier.name}
              subValue={`${money(tier.cost)} / unit`}
              quality={tier.quality}
              canDecrease={index > 0}
              canIncrease={nextUnlocked}
              nextLocked={hasNext && !nextUnlocked}
              onStep={(direction) => stepDraftPart(id, direction)}
              color={COMPONENT_COLORS[id].dot}
            />
          );
        })}
      </div>

      <DesignSummary parts={draft.parts} />
    </div>
  );
}
