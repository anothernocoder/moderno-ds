import { defineComponent, h, type Component, type PropType } from "vue";
import { Checkbox as ArkCheckbox, type CheckboxRootProps } from "@ark-ui/vue";
import { checkboxRecipe, type CheckboxSize } from "@moderno-ui/core";

export type { CheckboxSize } from "@moderno-ui/core";

export type ModernoCheckboxRootProps = CheckboxRootProps & { size?: CheckboxSize };

/**
 * Checkbox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the box/label density off
 * it. `checked`, `onCheckedChange`, `name`, … pass straight through via attrs.
 */
const CheckboxRootImpl = defineComponent({
  name: "ModernoCheckboxRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<CheckboxSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Forward all consumer props/handlers (checked, onCheckedChange, …) via
    // attrs; Ark's Root re-typed as a plain Component so the merged bag isn't
    // checked against its full prop union (we only add data-size).
    const Root = ArkCheckbox.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...checkboxRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Checkbox — tri-state (unchecked / checked / indeterminate) with a label; Ark
 * drives all of it. The root is a `<label>` bound to a visually hidden native
 * `<input type="checkbox">`, and every part carries
 * `data-state="checked|unchecked|indeterminate"` plus `data-disabled`/
 * `data-invalid`/`data-readonly` — Ark attributes, not CVA variants, are the
 * styling hooks. Only `Root` is wrapped to inject the `size` recipe; every
 * other part is Ark's verbatim.
 *
 * `Root` is annotated as a plain `Component<…>` so the emitted `.d.ts` doesn't
 * inline an un-nameable type pointing at internal `@zag-js` paths (TS2742).
 */
export const Checkbox: Omit<typeof ArkCheckbox, "Root"> & {
  Root: Component<ModernoCheckboxRootProps>;
} = {
  ...ArkCheckbox,
  Root: CheckboxRootImpl as unknown as Component<ModernoCheckboxRootProps>,
};

export type {
  CheckboxRootProps,
  CheckboxControlProps,
  CheckboxIndicatorProps,
  CheckboxLabelProps,
  CheckboxHiddenInputProps,
  CheckboxCheckedChangeDetails,
  CheckboxCheckedState,
} from "@ark-ui/vue";
