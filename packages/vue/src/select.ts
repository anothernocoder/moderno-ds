import { defineComponent, h, type Component, type PropType } from "vue";
import { Select as ArkSelect, type SelectRootComponent } from "@ark-ui/vue";
import { selectRecipe, type SelectSize } from "@moderno/core";

export type { SelectSize } from "@moderno/core";

/**
 * Select.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the trigger/menu density off
 * it. `collection`, `onValueChange`, etc. pass straight through via attrs.
 */
const SelectRootImpl = defineComponent({
  name: "ModernoSelectRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<SelectSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Forward all consumer props/handlers (collection, onValueChange, …) via
    // attrs; Ark's Root re-typed as a plain Component so the merged bag isn't
    // checked against its 200-key prop union (we only add data-size).
    const Root = ArkSelect.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...selectRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Select — collection + popover + keyboard navigation (Ark drives all of it).
 * Only `Root` is wrapped to inject the `size` recipe; every other part is Ark's
 * verbatim, styled by `components.css` keyed on Ark's `data-part` +
 * `data-highlighted`/`data-state` attributes.
 *
 * `Root` is typed via Ark's own `SelectRootComponent<P>`, so it keeps the full
 * collection generic and every Ark prop while also accepting `size`. The whole
 * object is annotated explicitly so the emitted `.d.ts` doesn't inline an
 * un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Select: Omit<typeof ArkSelect, "Root"> & {
  Root: SelectRootComponent<{ size?: SelectSize }>;
} = {
  ...ArkSelect,
  Root: SelectRootImpl as unknown as SelectRootComponent<{ size?: SelectSize }>,
};

export { createListCollection } from "@ark-ui/vue";
export type {
  CollectionItem,
  ListCollection,
  SelectRootProps,
  SelectValueChangeDetails,
} from "@ark-ui/vue";
