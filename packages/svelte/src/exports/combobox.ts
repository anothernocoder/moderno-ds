import { Combobox as ArkCombobox } from "@ark-ui/svelte";
import ComboboxRoot from "../ComboboxRoot.svelte";

/**
 * Combobox — a text input that filters a list of options as the user types.
 * Ark drives the machine: typing opens the list and reports the text
 * (`onInputValueChange`), the arrow keys move the highlight, Enter or a click
 * picks the highlighted item, and `multiple` keeps several. Ark filters
 * nothing itself: narrow the collection with `useListCollection` and
 * `useFilter`, and `Combobox.Empty` shows while nothing is left. Only `Root`
 * is wrapped to inject the `size` recipe; every other part is Ark's verbatim.
 * Annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Combobox: Omit<typeof ArkCombobox, "Root"> & { Root: typeof ComboboxRoot } = {
  ...ArkCombobox,
  Root: ComboboxRoot,
};
export { useFilter, useListCollection } from "@ark-ui/svelte";
export type { ComboboxSize } from "@moderno-ui/core";
export type {
  ComboboxHighlightChangeDetails,
  ComboboxInputValueChangeDetails,
  ComboboxOpenChangeDetails,
  ComboboxValueChangeDetails,
} from "@ark-ui/svelte";
