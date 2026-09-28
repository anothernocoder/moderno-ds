import { SegmentGroup as ArkSegmentGroup } from "@ark-ui/svelte";
import SegmentedControlRoot from "../SegmentedControlRoot.svelte";
import SegmentedControlItemText from "../SegmentedControlItemText.svelte";

/** Ark's parts but its `Label`, which Moderno leaves out (see below). */
const arkParts: Partial<typeof ArkSegmentGroup> = { ...ArkSegmentGroup };
delete arkParts.Label;

/**
 * SegmentedControl — pick one value from two to five options shown side by
 * side in one track, with a pill that slides behind the selected one. Ark's
 * SegmentGroup (a radio machine) drives it: the root is a
 * `role="radiogroup"`, each `Item` is a `<label>` bound to a visually hidden
 * native radio, and every item part carries `data-state` / `data-disabled` /
 * `data-invalid`. `Root` and `ItemText` are wrapped; every other part is
 * Ark's verbatim, except Ark's `Label`, left out: the root is the track, so a
 * label inside it would sit in the track. Name the control with `aria-label`,
 * or put it in a `Field` with a `Field.Label`. Annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const SegmentedControl: Omit<typeof ArkSegmentGroup, "Root" | "ItemText" | "Label"> & {
  Root: typeof SegmentedControlRoot;
  ItemText: typeof SegmentedControlItemText;
} = {
  ...(arkParts as Omit<typeof ArkSegmentGroup, "Label">),
  Root: SegmentedControlRoot,
  ItemText: SegmentedControlItemText,
};
export type { SegmentedControlSize } from "@moderno-ui/core";
export type { SegmentGroupValueChangeDetails as SegmentedControlValueChangeDetails } from "@ark-ui/svelte";
