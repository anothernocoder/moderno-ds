import { Toggle as ArkToggle } from "@ark-ui/svelte";
import ToggleRoot from "../ToggleRoot.svelte";

/**
 * Toggle — a button that stays pressed until it is pressed again. Ark renders
 * a native `<button>` with `aria-pressed` and `data-state="on|off"`; the
 * optional `Indicator` shows its children while on and its `fallback` snippet
 * while off. `Root` is wrapped to inject the `variant` × `size` recipe; every
 * other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Toggle: Omit<typeof ArkToggle, "Root"> & { Root: typeof ToggleRoot } = {
  ...ArkToggle,
  Root: ToggleRoot,
};
export type { ToggleVariant, ToggleSize } from "@moderno-ui/core";
