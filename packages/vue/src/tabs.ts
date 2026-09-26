import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Tabs as ArkTabs } from "@ark-ui/vue";
import type { TabsFocusChangeDetails, TabsRootProps, TabsValueChangeDetails } from "@ark-ui/vue";
import { tabsRecipe, type TabsSize, type TabsVariant } from "@moderno-ui/core";

export type { TabsSize, TabsVariant } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `variant` ×
 * `size` recipe. Ark-Vue declares the change callbacks as emits rather than
 * props, so they are spelled out here — a `h()` caller (and a template)
 * passes them as `onValueChange` / `onFocusChange` / `onUpdate:modelValue`
 * handlers, and `inheritAttrs: false` forwards them untouched.
 */
export interface ModernoTabsRootProps extends TabsRootProps {
  variant?: TabsVariant;
  size?: TabsSize;
  onValueChange?: (details: TabsValueChangeDetails) => void;
  onFocusChange?: (details: TabsFocusChangeDetails) => void;
  "onUpdate:modelValue"?: (value: string) => void;
}

/**
 * Tabs.Root with the Moderno `variant` × `size` recipe folded in. Ark's Root
 * spreads unknown attributes onto its `data-part="root"` element, so the
 * recipe's attributes ride along and `components.css` styles the list from
 * them. `defaultValue`, `orientation`, `activationMode`, … pass straight
 * through via attrs.
 */
const TabsRootImpl = defineComponent({
  name: "ModernoTabsRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<TabsVariant>, default: undefined },
    size: { type: String as PropType<TabsSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkTabs.Root as unknown as Component;
    return () =>
      h(Root, { ...attrs, ...tabsRecipe({ variant: props.variant, size: props.size }) }, slots);
  },
});

/**
 * Tabs — a list of tabs, each showing its own panel; one is selected at a
 * time. Ark drives all of it: the list is a `role="tablist"`, each `Trigger`
 * a native `<button role="tab">` with `aria-selected` and `data-selected`,
 * each `Content` a `role="tabpanel"` that is `hidden` unless its tab is
 * selected, and the optional `Indicator` is the mark Ark slides under the
 * selected tab. `Root` is wrapped to inject the recipe; every other part is
 * Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Tabs: Omit<typeof ArkTabs, "Root"> & {
  Root: DefineComponent<ModernoTabsRootProps>;
} = {
  ...ArkTabs,
  Root: TabsRootImpl as unknown as DefineComponent<ModernoTabsRootProps>,
};

export type {
  TabsRootProps,
  TabListProps,
  TabTriggerProps,
  TabContentProps,
  TabIndicatorProps,
  TabsValueChangeDetails,
} from "@ark-ui/vue";
