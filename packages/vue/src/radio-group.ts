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
import {
  partAttrs,
  radioGroupAttrs,
  type RadioGroupAspectRatio,
  type RadioGroupColumns,
  type RadioGroupSize,
  type RadioGroupVariant,
} from "@moderno-ui/core";

export type {
  RadioGroupAspectRatio,
  RadioGroupColumns,
  RadioGroupSize,
  RadioGroupVariant,
} from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno recipe
 * (`variant`, `size`, and for tiles `columns` and `aspectRatio`). Ark-Vue
 * declares the change callbacks as emits rather than props, so they are
 * spelled out here — a `h()` caller (and a template) passes them as
 * `onValueChange` / `onUpdate:modelValue` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoRadioGroupRootProps extends RadioGroupRootProps {
  variant?: RadioGroupVariant;
  size?: RadioGroupSize;
  columns?: RadioGroupColumns;
  aspectRatio?: RadioGroupAspectRatio;
  onValueChange?: (details: RadioGroupValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: RadioGroupValueChangeDetails["value"]) => void;
}

/** Props of `RadioGroup.ItemDescription`: a plain span, styled by its `data-part`. */
export type RadioGroupItemDescriptionProps = HTMLAttributes;

/** Props of `RadioGroup.ItemMedia`: a plain span, styled by its `data-part`. */
export type RadioGroupItemMediaProps = HTMLAttributes;

/**
 * RadioGroup.Root with the Moderno recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the attributes
 * of `radioGroupAttrs` (`data-variant`, `data-size`, `data-columns`,
 * `data-aspect-ratio`) ride along and `components.css` keys the layout and
 * density off them. `value`, `onValueChange`, `orientation`, `name`, … pass
 * straight through via attrs.
 */
const RadioGroupRootImpl = defineComponent({
  name: "ModernoRadioGroupRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<RadioGroupVariant>, default: undefined },
    size: { type: String as PropType<RadioGroupSize>, default: undefined },
    columns: { type: Number as PropType<RadioGroupColumns>, default: undefined },
    aspectRatio: { type: String as PropType<RadioGroupAspectRatio>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-attributes).
    const Root = ArkRadioGroup.Root as unknown as Component;
    return () =>
      h(
        Root,
        {
          ...attrs,
          ...radioGroupAttrs({
            variant: props.variant,
            size: props.size,
            columns: props.columns,
            aspectRatio: props.aspectRatio,
          }),
        },
        slots,
      );
  },
});

/**
 * RadioGroup.ItemDescription — a hint under an option's label. Moderno's
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
 * RadioGroup.ItemMedia — a tile's image, or any other content, above its
 * label. Moderno's addition to Ark's anatomy: it keeps the root's
 * `aspectRatio` and crops an image to fill it. `ItemText` names the radio,
 * so an image here takes `alt=""` unless the item has no `ItemText`.
 */
const RadioGroupItemMediaImpl = defineComponent({
  name: "ModernoRadioGroupItemMedia",
  inheritAttrs: false,
  setup(_props, { slots, attrs }) {
    return () =>
      h("span", { ...attrs, ...partAttrs("radio-group", "item-media") }, slots.default?.());
  },
});

/**
 * RadioGroup — pick exactly one option from a short list, as radios or as
 * tiles (`variant="tile"`: a grid of cards, each with an image); Ark drives
 * all of it. The root is a `role="radiogroup"` bound to its `Label`, each
 * `Item` is a `<label>` bound to a visually hidden native
 * `<input type="radio">`, and every item part carries
 * `data-state="checked|unchecked"` plus `data-disabled`/`data-invalid`/
 * `data-readonly`; Ark's `orientation` stamps `data-orientation`. Ark
 * attributes, not CVA variants, are the styling hooks. `Root` is wrapped to
 * inject the recipe, and `ItemMedia` and `ItemDescription` are Moderno's;
 * every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const RadioGroup: Omit<typeof ArkRadioGroup, "Root"> & {
  Root: DefineComponent<ModernoRadioGroupRootProps>;
  ItemDescription: DefineComponent<RadioGroupItemDescriptionProps>;
  ItemMedia: DefineComponent<RadioGroupItemMediaProps>;
} = {
  ...ArkRadioGroup,
  Root: RadioGroupRootImpl as unknown as DefineComponent<ModernoRadioGroupRootProps>,
  ItemDescription:
    RadioGroupItemDescriptionImpl as unknown as DefineComponent<RadioGroupItemDescriptionProps>,
  ItemMedia: RadioGroupItemMediaImpl as unknown as DefineComponent<RadioGroupItemMediaProps>,
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
