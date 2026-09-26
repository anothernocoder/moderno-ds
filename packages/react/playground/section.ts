import type { ReactElement } from "react";

/** What the playground hands every section. */
export interface SectionProps {
  /** Mount popovers open (Dialog, Select), to exercise the portal and id path. */
  open: boolean;
}

/**
 * One component's slice of the SSR playground: `sections/<slug>.tsx`
 * default-exports one, and `pnpm gen` mounts it in `app.tsx`. A section that
 * has no popover ignores `open`.
 */
export type Section = (props: SectionProps) => ReactElement;
