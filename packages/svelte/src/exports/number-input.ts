import { NumberInput as ArkNumberInput } from "@ark-ui/svelte";
import NumberInputRoot from "../NumberInputRoot.svelte";

/**
 * NumberInput — a text box for a number, with buttons that step it up and
 * down. Ark renders the `Input` as a `role="spinbutton"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; the arrow keys, the
 * steppers and an optional `Scrubber` change the value by `step`; Ark formats
 * it with `formatOptions` and clamps it to `min`/`max` on blur. `Root` is
 * wrapped to inject the `size` recipe; every other part is Ark's verbatim.
 * Annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const NumberInput: Omit<typeof ArkNumberInput, "Root"> & { Root: typeof NumberInputRoot } = {
  ...ArkNumberInput,
  Root: NumberInputRoot,
};
export type { NumberInputSize } from "@moderno-ui/core";
export type {
  NumberInputValueChangeDetails,
  NumberInputFocusChangeDetails,
  NumberInputValueInvalidDetails,
} from "@ark-ui/svelte";
