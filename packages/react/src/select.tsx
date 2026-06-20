import { Select as ArkSelect } from "@ark-ui/react";
import type { CollectionItem, SelectRootProps } from "@ark-ui/react";
import { selectRecipe, type VariantProps } from "@moderno/core";

/** The control density a consumer can choose. Selection state stays Ark's. */
export type SelectSize = NonNullable<VariantProps<typeof selectRecipe.variants>["size"]>;

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
 * clean). The only Moderno addition is the `size` recipe on `Root`; every part's
 * appearance — trigger, content, highlighted/checked items — is `components.css`
 * keyed on Ark's `data-part` + `data-highlighted`/`data-state` attributes.
 */
export const Select = {
  Root: SelectRoot,
  Label: ArkSelect.Label,
  Control: ArkSelect.Control,
  Trigger: ArkSelect.Trigger,
  ValueText: ArkSelect.ValueText,
  Indicator: ArkSelect.Indicator,
  Positioner: ArkSelect.Positioner,
  Content: ArkSelect.Content,
  List: ArkSelect.List,
  Item: ArkSelect.Item,
  ItemText: ArkSelect.ItemText,
  ItemIndicator: ArkSelect.ItemIndicator,
  HiddenSelect: ArkSelect.HiddenSelect,
};

export { createListCollection } from "@ark-ui/react";
export type { CollectionItem, ListCollection, SelectValueChangeDetails } from "@ark-ui/react";
