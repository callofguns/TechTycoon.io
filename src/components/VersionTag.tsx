import { APP_VERSION } from '../lib/version';

/**
 * Small build label pinned above the bottom nav. Purely informational —
 * pointer-events-none so it never intercepts a tap. It floats over whatever
 * scrollable content ends up behind it, so it carries its own translucent
 * backdrop rather than sitting on bare transparency — otherwise long pages
 * can scroll text right up underneath and the two visually merge together.
 */
export function VersionTag() {
  return (
    <div className="pointer-events-none absolute bottom-[68px] right-3 z-30 select-none rounded-pill bg-ink-800/80 px-2 py-0.5 text-[10px] font-medium text-white/25 backdrop-blur-sm">
      {APP_VERSION}
    </div>
  );
}
