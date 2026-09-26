import {
  defineComponent,
  h,
  type Component,
  type DefineComponent,
  type HTMLAttributes,
  type PropType,
} from "vue";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/vue";
import type { RadioGroupRootProps, RadioGroupValueChangeDetails } from "@ark-ui/vue";
import { partAttrs, radioGroupRecipe, type RadioGroupSize } from "@moderno-ui/core";

export type { RadioGroupSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onValueChange` / `onUpdate:modelValue` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoRadioGroupRootProps extends RadioGroupRootProps {
  size?: RadioGroupSize;
  onValueChange?: (details: RadioGroupValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: RadioGroupValueChangeDetails["value"]) => void;
}

/** Props of `RadioGroup.ItemDescription`: a plain span, styled by its `data-part`. */
export type RadioGroupItemDescriptionProps = HTMLAttributes;

/**
 * RadioGroup.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the circle and text
 * density off it. `value`, `onValueChange`, `orientation`, `name`, … pass
 * straight through via attrs.
 */
const RadioGroupRootImpl = defineComponent({
  name: "ModernoRadioGroupRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<RadioGroupSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add data-size).
    const Root = ArkRadioGroup.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...radioGroupRecipe({ size: props.size }) }, slots);
  },
});

/**
 * RadioGroup.ItemDescription — a hint under an option's label. Moderno's one
 * addition to Ark's anatomy: place it inside `RadioGroup.ItemText`, which
 * names the option's radio, so screen readers read it with the label.
 */
const RadioGroupItemDescriptionImpl = defineComponent({
  name: "ModernoRadioGroupItemDescription",
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    return () =>
      h("span", { ...attrs, ...partAttrs("radio-group", "item-description") }, slots.default?.());
  },
});

/**
 * RadioGroup — pick exactly one option from a short list; Ark drives all of
 * it. The root is a `role="radiogroup"` bound to its `Label`, each `Item` is a
 * `<label>` bound to a visually hidden native `<input type="radio">`, and every
 * item part carries `data-state="checked|unchecked"` plus `data-disabled`/
 * `data-invalid`/`data-readonly`; Ark's `orientation` stamps
 * `data-orientation`. Ark attributes, not CVA variants, are the styling hooks.
 * `Root` is wrapped to inject the `size` recipe and `ItemDescription` is
 * Moderno's; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const RadioGroup: Omit<typeof ArkRadioGroup, "Root"> & {
  Root: DefineComponent<ModernoRadioGroupRootProps>;
  ItemDescription: DefineComponent<RadioGroupItemDescriptionProps>;
} = {
  ...ArkRadioGroup,
  Root: RadioGroupRootImpl as unknown as DefineComponent<ModernoRadioGroupRootProps>,
  ItemDescription:
    RadioGroupItemDescriptionImpl as unknown as DefineComponent<RadioGroupItemDescriptionProps>,
};

export type {
  RadioGroupRootProps,
  RadioGroupLabelProps,
  RadioGroupItemProps,
  RadioGroupItemControlProps,
  RadioGroupItemTextProps,
  RadioGroupItemHiddenInputProps,
  RadioGroupIndicatorProps,
  RadioGroupValueChangeDetails,
} from "@ark-ui/vue";
