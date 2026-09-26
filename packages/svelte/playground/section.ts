/**
 * What the playground hands every section. A section is one component's slice
 * of the SSR playground: `sections/<Name>.svelte` declares these props, and
 * `pnpm gen` mounts it in `App.svelte`. A section that has no popover ignores
 * `open`.
 */
export interface SectionProps {
  /** Mount popovers open (Dialog, Select), to exercise the portal and trigger state. */
  open: boolean;
}
