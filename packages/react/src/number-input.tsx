import { NumberInput as ArkNumberInput } from "@ark-ui/react";
import type { NumberInputRootProps } from "@ark-ui/react";
import { numberInputRecipe, type NumberInputSize } from "@moderno-ui/core";

export type { NumberInputSize } from "@moderno-ui/core";

export interface ModernoNumberInputRootProps extends NumberInputRootProps {
  /** Box height, stepper width and type — resolves to `data-size` on the root part. */
  size?: NumberInputSize;
}

/**
 * NumberInput.Root with the Moderno `size` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function NumberInputRoot({ size, ...props }: ModernoNumberInputRootProps) {
  return <ArkNumberInput.Root {...props} {...numberInputRecipe({ size })} />;
}

/**
 * NumberInput — a text box for a number, with buttons that step it up and
 * down.
 *
 * Ark drives the machine: the `Input` is a `role="spinbutton"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; the arrow keys, the
 * steppers and an optional `Scrubber` change the value by `step`; Ark formats
 * it with `formatOptions` and clamps it to `min`/`max` on blur. The value is a
 * string, so an empty box is `""`. The recipe only adds the `size` a consumer
 * picks. Anatomy: `Root > Label + Control > Input + DecrementTrigger +
 * IncrementTrigger`, with an optional `Scrubber` and `ValueText`. `Root` is
 * wrapped for the recipe; every other part is Ark's verbatim. The object is
 * annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
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
} from "@ark-ui/react";
