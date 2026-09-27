import { defineComponent, h, type Component, type PropType } from "vue";
import { Combobox as ArkCombobox, type ComboboxRootComponent } from "@ark-ui/vue";
import { comboboxRecipe, type ComboboxSize } from "@moderno-ui/core";

export type { ComboboxSize } from "@moderno-ui/core";

/**
 * Combobox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` sizes the control from it.
 * `collection`, `multiple`, `v-model`, `onInputValueChange`, … pass straight
 * through via attrs.
 */
const ComboboxRootImpl = defineComponent({
  name: "ModernoComboboxRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<ComboboxSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-size).
    const Root = ArkCombobox.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...comboboxRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Combobox — a text input that filters a list of options as the user types.
 * Ark drives the machine: typing opens the list and reports the text
 * (`@input-value-change`), the arrow keys move the highlight, Enter or a
 * click picks the highlighted item, and `multiple` keeps several. Ark
 * filters nothing itself: narrow the collection with `useListCollection` and
 * `useFilter`, and `Combobox.Empty` shows while nothing is left. Only `Root`
 * is wrapped to inject the `size` recipe; every other part is Ark's verbatim.
 *
 * `Root` is typed via Ark's own `ComboboxRootComponent<P>`, so it keeps the
 * full collection generic and every Ark prop while also accepting `size`. The
 * whole object is annotated explicitly so the emitted `.d.ts` doesn't inline
 * an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Combobox: Omit<typeof ArkCombobox, "Root"> & {
  Root: ComboboxRootComponent<{ size?: ComboboxSize }>;
} = {
  ...ArkCombobox,
  Root: ComboboxRootImpl as unknown as ComboboxRootComponent<{ size?: ComboboxSize }>,
};

export { useFilter, useListCollection } from "@ark-ui/vue";
export type {
  ComboboxRootProps,
  ComboboxHighlightChangeDetails,
  ComboboxInputValueChangeDetails,
  ComboboxOpenChangeDetails,
  ComboboxValueChangeDetails,
} from "@ark-ui/vue";
