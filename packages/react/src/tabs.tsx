import { Tabs as ArkTabs } from "@ark-ui/react";
import type { TabsRootProps } from "@ark-ui/react";
import { tabsRecipe, type TabsSize, type TabsVariant } from "@moderno-ui/core";

export type { TabsSize, TabsVariant } from "@moderno-ui/core";

export interface ModernoTabsRootProps extends TabsRootProps {
  /** Visual style of the list and its triggers — resolves to `data-variant` on the root part. */
  variant?: TabsVariant;
  /** Density of every trigger — resolves to `data-size` on the root part. */
  size?: TabsSize;
}

/**
 * Tabs.Root with the Moderno `variant` × `size` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attributes ride along and `components.css` styles the list from them.
 */
function TabsRoot({ variant, size, ...props }: ModernoTabsRootProps) {
  return <ArkTabs.Root {...props} {...tabsRecipe({ variant, size })} />;
}

/**
 * Tabs — a list of tabs, each showing its own panel; one is selected at a time.
 *
 * Ark drives the machine: the list is a `role="tablist"`, each `Trigger` a
 * native `<button role="tab">` with `aria-selected` and `data-selected`, and
 * each `Content` a `role="tabpanel"` that is `hidden` unless its tab is
 * selected. Arrow keys move between tabs (up and down when vertical), Home
 * and End jump to the ends. The optional `Indicator` is the mark Ark slides
 * under the selected tab. The recipe only adds the `variant` and `size` a
 * consumer picks. Anatomy: `Root > List > (Trigger, Indicator)` + `Content`.
 * `Root` is wrapped for the recipe; every other part is Ark's verbatim. The
 * object is annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
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
} from "@ark-ui/react";
