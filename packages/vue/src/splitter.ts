import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Splitter as ArkSplitter } from "@ark-ui/vue";
import type {
  SplitterRootProps,
  SplitterResizeDetails,
  SplitterResizeEndDetails,
  SplitterExpandCollapseDetails,
} from "@ark-ui/vue";
import { splitterRecipe, type SplitterVariant } from "@moderno-ui/core";

export type { SplitterVariant } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `variant`
 * recipe. Ark-Vue declares the callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onResize` / `onUpdate:size` handlers, and `inheritAttrs: false` forwards
 * them untouched.
 */
export interface ModernoSplitterRootProps extends SplitterRootProps {
  variant?: SplitterVariant;
  onResize?: (details: SplitterResizeDetails) => void;
  onResizeStart?: () => void;
  onResizeEnd?: (details: SplitterResizeEndDetails) => void;
  onCollapse?: (details: SplitterExpandCollapseDetails) => void;
  onExpand?: (details: SplitterExpandCollapseDetails) => void;
  "onUpdate:size"?: (size: number[]) => void;
}

/**
 * Splitter.Root with the Moderno `variant` recipe folded in. Ark's Root
 * spreads unknown attributes onto its `data-part="root"` element, so the
 * recipe's attribute rides along and `components.css` styles the parts from
 * it. `panels`, `defaultSize`, `size`, `orientation`, … pass straight through
 * via attrs.
 */
const SplitterRootImpl = defineComponent({
  name: "ModernoSplitterRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<SplitterVariant>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkSplitter.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...splitterRecipe({ variant: props.variant }) }, slots);
  },
});

/**
 * Splitter — panels side by side (or stacked) that the user resizes by
 * dragging the boundary between them, or with the keyboard. Ark drives all
 * of it: `panels` names each panel and its limits, each size is a
 * percentage, and each `ResizeTrigger` between two panels is a
 * `role="separator"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
 * and `aria-controls`; arrow keys move it, Home and End push it to a limit,
 * and Enter collapses or expands a collapsible panel. `Root` is wrapped to
 * inject the recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Splitter: Omit<typeof ArkSplitter, "Root"> & {
  Root: DefineComponent<ModernoSplitterRootProps>;
} = {
  ...ArkSplitter,
  Root: SplitterRootImpl as unknown as DefineComponent<ModernoSplitterRootProps>,
};

export type {
  SplitterRootProps,
  SplitterPanelProps,
  SplitterResizeTriggerProps,
  SplitterResizeTriggerIndicatorProps,
  SplitterPanelData,
  SplitterResizeDetails,
  SplitterResizeEndDetails,
  SplitterExpandCollapseDetails,
} from "@ark-ui/vue";
