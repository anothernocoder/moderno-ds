import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { NumberInput as ArkNumberInput } from "@ark-ui/vue";
import type {
  NumberInputRootProps,
  NumberInputValueChangeDetails,
  NumberInputFocusChangeDetails,
  NumberInputValueInvalidDetails,
} from "@ark-ui/vue";
import { numberInputRecipe, type NumberInputSize } from "@moderno-ui/core";

export type { NumberInputSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onValueChange` / `onUpdate:modelValue` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoNumberInputRootProps extends NumberInputRootProps {
  size?: NumberInputSize;
  onValueChange?: (details: NumberInputValueChangeDetails) => void;
  onValueInvalid?: (details: NumberInputValueInvalidDetails) => void;
  onFocusChange?: (details: NumberInputFocusChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string) => void;
}

/**
 * NumberInput.Root with the Moderno `size` recipe folded in. Ark's Root
 * spreads unknown attributes onto its `data-part="root"` element, so the
 * recipe's attribute rides along and `components.css` sizes the parts from
 * it. `defaultValue`, `modelValue`, `min`, `max`, `step`, `formatOptions`, …
 * pass straight through via attrs.
 */
const NumberInputRootImpl = defineComponent({
  name: "ModernoNumberInputRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<NumberInputSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkNumberInput.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...numberInputRecipe({ size: props.size }) }, slots);
  },
});

/**
 * NumberInput — a text box for a number, with buttons that step it up and
 * down. Ark drives all of it: the `Input` is a `role="spinbutton"` with
 * `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; the arrow keys, the
 * steppers and an optional `Scrubber` change the value by `step`; Ark formats
 * it with `formatOptions` and clamps it to `min`/`max` on blur. `Root` is
 * wrapped to inject the recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const NumberInput: Omit<typeof ArkNumberInput, "Root"> & {
  Root: DefineComponent<ModernoNumberInputRootProps>;
} = {
  ...ArkNumberInput,
  Root: NumberInputRootImpl as unknown as DefineComponent<ModernoNumberInputRootProps>,
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
} from "@ark-ui/vue";
