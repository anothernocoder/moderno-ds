import { ToggleGroup as ArkToggleGroup } from "@ark-ui/svelte";
import ToggleGroupRoot from "../ToggleGroupRoot.svelte";

/**
 * ToggleGroup — a row of toggle buttons; one or several stay pressed. Single
 * selection makes the root a `role="radiogroup"` of `role="radio"` buttons,
 * `multiple` a `role="group"` of `aria-pressed` buttons; items carry
 * `data-state="on|off"`, `data-disabled` and `data-orientation`. `Root` is
 * wrapped to inject the `variant` × `size` recipe; every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const ToggleGroup: Omit<typeof ArkToggleGroup, "Root"> & { Root: typeof ToggleGroupRoot } = {
  ...ArkToggleGroup,
  Root: ToggleGroupRoot,
};
export type { ToggleGroupVariant, ToggleGroupSize } from "@moderno-ui/core";
export type { ToggleGroupValueChangeDetails } from "@ark-ui/svelte";
