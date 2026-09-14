import { StepperRow } from '../../components/StepperRow';
import { DesignSummary } from '../../components/DesignSummary';
import { SectionTitle } from '../../components/Screen';
import { HARDWARE_COMPONENT_IDS, getComponent, isTierUnlocked } from '../../game/components';
import { money } from '../../lib/format';
import { COMPONENT_COLORS } from '../../lib/componentColors';
import { useGameStore } from '../../store/gameStore';

/** Stage 1: pick the internals. */
export function HardwareStage() {
  const draft = useGameStore((s) => s.draft);
  const unlockedTierIndex = useGameStore((s) => s.unlockedTierIndex);
  const stepDraftPart = useGameStore((s) => s.stepDraftPart);

  return (
    <div className="flex flex-col gap-3">
      <DesignSummary parts={draft.parts} />

      <SectionTitle>Internals</SectionTitle>
      <div className="card px-3 py-2">
        {HARDWARE_COMPONENT_IDS.map((id) => {
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

      <p className="px-1 text-[11.5px] leading-snug text-white/30">
        Better parts raise quality but cost more to build. Locked tiers are bought with cash and
        research points on the More tab.
      </p>
    </div>
  );
}
