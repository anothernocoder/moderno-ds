import type { FunctionalComponent } from "vue";

/** What the playground hands every section. */
export interface SectionProps {
  /** Mount popovers open (Dialog, Select), to exercise the portal and id path. */
  open: boolean;
}

/**
 * One component's slice of the SSR playground: `sections/<slug>.ts`
 * default-exports one, and `pnpm gen` mounts it in `app.ts`. It stays an `h()`
 * render function; a section that has no popover ignores `open`.
 */
export type Section = FunctionalComponent<SectionProps>;
