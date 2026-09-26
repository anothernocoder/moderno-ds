import { splitProps } from "solid-js";
import { Tabs as ArkTabs } from "@ark-ui/solid";
import type { TabsRootProps } from "@ark-ui/solid";
import { tabsRecipe, type TabsSize, type TabsVariant } from "@moderno-ui/core";

export type { TabsSize, TabsVariant } from "@moderno-ui/core";

export type ModernoTabsRootProps = TabsRootProps & {
  /** Visual style of the list and its triggers — resolves to `data-variant` on the root part. */
  variant?: TabsVariant;
  /** Density of every trigger — resolves to `data-size` on the root part. */
  size?: TabsSize;
};

/**
 * Tabs.Root with the Moderno `variant` × `size` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attributes ride along and `components.css` styles the list from them.
 */
function TabsRoot(props: ModernoTabsRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size"]);
  return <ArkTabs.Root {...rest} {...tabsRecipe({ variant: local.variant, size: local.size })} />;
}

/**
 * Tabs — a list of tabs, each showing its own panel; one is selected at a
 * time. Ark drives all of it: the list is a `role="tablist"`, each `Trigger`
 * a native `<button role="tab">` with `aria-selected` and `data-selected`,
 * each `Content` a `role="tabpanel"` that is `hidden` unless its tab is
 * selected, and the optional `Indicator` is the mark Ark slides under the
 * selected tab. `Root` is wrapped to inject the recipe; every other part is
 * Ark's verbatim. The object is annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Tabs: Omit<typeof ArkTabs, "Root"> & { Root: typeof TabsRoot } = {
  ...ArkTabs,
  Root: TabsRoot,
};

export type {
  TabsRootProps,
  TabListProps,
  TabTriggerProps,
  TabContentProps,
  TabIndicatorProps,
  TabsValueChangeDetails,
} from "@ark-ui/solid";
