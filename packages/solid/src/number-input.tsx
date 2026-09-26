import { splitProps } from "solid-js";
import { NumberInput as ArkNumberInput } from "@ark-ui/solid";
import type { NumberInputRootProps } from "@ark-ui/solid";
import { numberInputRecipe, type NumberInputSize } from "@moderno-ui/core";

export type { NumberInputSize } from "@moderno-ui/core";

export type ModernoNumberInputRootProps = NumberInputRootProps & {
  /** Box height, stepper width and type — resolves to `data-size` on the root part. */
  size?: NumberInputSize;
};

/**
 * NumberInput.Root with the Moderno `size` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function NumberInputRoot(props: ModernoNumberInputRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkNumberInput.Root {...rest} {...numberInputRecipe({ size: local.size })} />;
}

/**
 * NumberInput — a text box for a number, with buttons that step it up and
 * down. Ark drives all of it: the `Input` is a `role="spinbutton"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; the arrow keys, the
 * steppers and an optional `Scrubber` change the value by `step`; Ark formats
 * it with `formatOptions` and clamps it to `min`/`max` on blur. `Root` is
 * wrapped to inject the recipe; every other part is Ark's verbatim. The object
 * is annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const NumberInput: Omit<typeof ArkNumberInput, "Root"> & {
  Root: typeof NumberInputRoot;
} = {
  ...ArkNumberInput,
  Root: NumberInputRoot,
};

export type {
  NumberInputRootProps,
  NumberInputLabelProps,
  NumberInputControlProps,
  NumberInputInputProps,
  NumberInputDecrementTriggerProps,
  NumberInputIncrementTriggerProps,
  NumberInputScrubberProps,
  NumberInputValueTextProps,
  NumberInputValueChangeDetails,
  NumberInputFocusChangeDetails,
  NumberInputValueInvalidDetails,
} from "@ark-ui/solid";
