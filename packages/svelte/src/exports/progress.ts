import { Progress as ArkProgress } from "@ark-ui/svelte";
import ProgressRoot from "../ProgressRoot.svelte";

/**
 * Progress — how far a task has come, as a bar or a ring. Ark renders the
 * `Track` (linear) or the `Circle` (circular) as the `role="progressbar"`
 * with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; every part
 * carries `data-state` (`loading`, `complete`, or `indeterminate` when
 * `value` is `null`), the `Range` and `CircleRange` show the percentage and
 * `ValueText` prints it. `Root` is wrapped to inject the `size` recipe; every
 * other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Progress: Omit<typeof ArkProgress, "Root"> & { Root: typeof ProgressRoot } = {
  ...ArkProgress,
  Root: ProgressRoot,
};
export type { ProgressSize } from "@moderno-ui/core";
export type { ProgressValueChangeDetails } from "@ark-ui/svelte";
