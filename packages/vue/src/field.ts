import { defineComponent, h, type Component, type PropType } from "vue";
import { Field as ArkField, type FieldRootProps } from "@ark-ui/vue";
import { fieldRecipe, type FieldSize } from "@moderno-ui/core";

export type { FieldSize } from "@moderno-ui/core";

/**
 * Field.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` sizes every part from that one
 * attribute. `invalid`, `disabled`, `required`, … pass straight through as attrs.
 */
const FieldRootImpl = defineComponent({
  name: "ModernoFieldRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<FieldSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Forward all consumer props/handlers via attrs; Ark's Root re-typed as a
    // plain Component so the merged bag isn't checked against its full prop
    // union (we only add data-size).
    const Root = ArkField.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...fieldRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Field — form control + accessibility (Ark drives all of it).
 *
 * Ark's Field machine wires `label[for]` ↔ control `id`, mirrors
 * `aria-invalid`/`aria-describedby`, and emits `data-invalid`/`data-disabled`/
 * `data-required` on every part. Those Ark attributes are the styling hooks for
 * *state*; the only prop-driven knob is `size`, so `Root` is the single wrapped
 * part and every other part is Ark's verbatim, dressed by `components.css`
 * identically to React.
 */
export const Field: Omit<typeof ArkField, "Root"> & {
  Root: Component<FieldRootProps & { size?: FieldSize }>;
} = {
  ...ArkField,
  Root: FieldRootImpl as unknown as Component<FieldRootProps & { size?: FieldSize }>,
};

export type {
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "@ark-ui/vue";
