import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/vue";
import type { ToggleGroupRootProps, ToggleGroupValueChangeDetails } from "@ark-ui/vue";
import { toggleGroupRecipe, type ToggleGroupSize, type ToggleGroupVariant } from "@moderno-ui/core";

export type { ToggleGroupSize, ToggleGroupVariant } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `variant` ×
 * `size` recipe. Ark-Vue declares the change callbacks as emits rather than
 * props, so they are spelled out here — a `h()` caller (and a template)
 * passes them as `onValueChange` / `onUpdate:modelValue` handlers, and
 * `inheritAttrs: false` forwards them untouched.
 */
export interface ModernoToggleGroupRootProps extends ToggleGroupRootProps {
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  onValueChange?: (details: ToggleGroupValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string[]) => void;
}

/**
 * ToggleGroup.Root with the Moderno `variant` × `size` recipe folded in.
 * Ark's Root spreads unknown attributes onto its `data-part="root"` element,
 * so the recipe's attributes ride along and `components.css` styles every
 * item from them. `value`, `multiple`, `orientation`, … pass straight through
 * via attrs.
 */
const ToggleGroupRootImpl = defineComponent({
  name: "ModernoToggleGroupRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ToggleGroupVariant>, default: undefined },
    size: { type: String as PropType<ToggleGroupSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkToggleGroup.Root as unknown as Component;
    return () =>
      h(
        Root,
        { ...attrs, ...toggleGroupRecipe({ variant: props.variant, size: props.size }) },
        slots,
      );
  },
});

/**
 * ToggleGroup — a row of toggle buttons; one or several stay pressed. Ark
 * drives all of it: single selection makes the root a `role="radiogroup"` of
 * `role="radio"` buttons, `multiple` a `role="group"` of `aria-pressed`
 * buttons; items carry `data-state="on|off"`, `data-disabled` and
 * `data-orientation`, and arrow keys move focus between them. `Root` is
 * wrapped to inject the recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const ToggleGroup: Omit<typeof ArkToggleGroup, "Root"> & {
  Root: DefineComponent<ModernoToggleGroupRootProps>;
} = {
  ...ArkToggleGroup,
  Root: ToggleGroupRootImpl as unknown as DefineComponent<ModernoToggleGroupRootProps>,
};

export type {
  ToggleGroupRootProps,
  ToggleGroupItemProps,
  ToggleGroupValueChangeDetails,
} from "@ark-ui/vue";
