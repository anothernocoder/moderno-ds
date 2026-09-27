import { splitProps } from "solid-js";
import { Combobox as ArkCombobox } from "@ark-ui/solid";
import type { CollectionItem, ComboboxRootProps } from "@ark-ui/solid";
import { comboboxRecipe, type ComboboxSize } from "@moderno-ui/core";

export type { ComboboxSize } from "@moderno-ui/core";

export type ModernoComboboxRootProps<T extends CollectionItem> = ComboboxRootProps<T> & {
  /** Box height and type — resolves to `data-size` on the root part. */
  size?: ComboboxSize;
};

/**
 * Combobox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` sizes the control from it.
 * Generic over the collection item type, exactly like Ark's own Root.
 */
function ComboboxRoot<T extends CollectionItem>(props: ModernoComboboxRootProps<T>) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkCombobox.Root {...rest} {...comboboxRecipe({ size: local.size })} />;
}

/**
 * Combobox — a text input that filters a list of options as the user types.
 * Ark drives the machine: typing opens the list and reports the text
 * (`onInputValueChange`), the arrow keys move the highlight, Enter or a click
 * picks the highlighted item, and `multiple` keeps several. Ark filters
 * nothing itself: narrow the collection with `useListCollection` and
 * `useFilter`, and `Combobox.Empty` shows while nothing is left. Only `Root`
 * is wrapped to inject the `size` recipe; every other part is Ark's verbatim.
 * The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Combobox: Omit<typeof ArkCombobox, "Root"> & { Root: typeof ComboboxRoot } = {
  ...ArkCombobox,
  Root: ComboboxRoot,
};

export { useFilter, useListCollection } from "@ark-ui/solid";
export type {
  ComboboxHighlightChangeDetails,
  ComboboxInputValueChangeDetails,
  ComboboxOpenChangeDetails,
  ComboboxValueChangeDetails,
} from "@ark-ui/solid";
