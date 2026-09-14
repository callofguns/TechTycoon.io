import { APP_VERSION } from '../lib/version';

/**
 * Small build label pinned above the bottom nav. Purely informational —
 * pointer-events-none so it never intercepts a tap.
 */
export function VersionTag() {
  return (
    <div className="pointer-events-none absolute bottom-[68px] right-3 z-30 select-none text-[10px] font-medium text-white/20">
      {APP_VERSION}
    </div>
  );
}
