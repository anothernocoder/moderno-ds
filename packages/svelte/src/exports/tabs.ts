import { Tabs as ArkTabs } from "@ark-ui/svelte";
import TabsRoot from "../TabsRoot.svelte";

/**
 * Tabs — a list of tabs, each showing its own panel; one is selected at a
 * time. Ark renders a `role="tablist"` list of native `<button role="tab">`
 * triggers with `aria-selected` and `data-selected`, a `role="tabpanel"`
 * content per tab that is `hidden` unless selected, and the optional
 * `Indicator` it slides under the selected tab. `Root` is wrapped to inject
 * the `variant` × `size` recipe; every other part is Ark's verbatim.
 * Annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Tabs: Omit<typeof ArkTabs, "Root"> & { Root: typeof TabsRoot } = {
  ...ArkTabs,
  Root: TabsRoot,
};
export type { TabsVariant, TabsSize } from "@moderno-ui/core";
export type { TabsValueChangeDetails } from "@ark-ui/svelte";
