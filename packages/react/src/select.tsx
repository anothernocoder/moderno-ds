import { Select as ArkSelect } from "@ark-ui/react";
import type { CollectionItem, SelectRootProps } from "@ark-ui/react";
import { selectRecipe, type SelectSize } from "@moderno/core";

export type { SelectSize } from "@moderno/core";

export type ModernoSelectRootProps<T extends CollectionItem> = SelectRootProps<T> & {
  size?: SelectSize;
};

/**
 * Select.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the trigger/menu density off
 * it. Generic over the collection item type, exactly like Ark's own Root.
 */
function SelectRoot<T extends CollectionItem>({ size, ...props }: ModernoSelectRootProps<T>) {
  return <ArkSelect.Root {...props} {...selectRecipe({ size })} />;
}

/**
 * Select — collection + popover + keyboard navigation.
 *
 * Ark drives typeahead, arrow-key highlight, selection, and popover positioning;
 * the menu renders in a `Portal` (unmounted while closed, so SSR/hydration stay
 * clean). Only `Root` is wrapped to inject the `size` recipe; every other part
 * is Ark's verbatim — the spread keeps parts Ark adds in future versions. Each
 * part's appearance — trigger, content, highlighted/checked items — is
 * `components.css` keyed on Ark's `data-part` + `data-highlighted`/`data-state`
 * attributes. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Select: Omit<typeof ArkSelect, "Root"> & { Root: typeof SelectRoot } = {
  ...ArkSelect,
  Root: SelectRoot,
};

export { createListCollection } from "@ark-ui/react";
export type { CollectionItem, ListCollection, SelectValueChangeDetails } from "@ark-ui/react";
