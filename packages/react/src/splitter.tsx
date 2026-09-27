import { Splitter as ArkSplitter } from "@ark-ui/react";
import type { SplitterRootProps } from "@ark-ui/react";
import { splitterRecipe, type SplitterVariant } from "@moderno-ui/core";

export type { SplitterVariant } from "@moderno-ui/core";

export interface ModernoSplitterRootProps extends SplitterRootProps {
  /** Visual style of the panels and triggers — resolves to `data-variant` on the root part. */
  variant?: SplitterVariant;
}

/**
 * Splitter.Root with the Moderno `variant` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` styles the parts from it.
 */
function SplitterRoot({ variant, ...props }: ModernoSplitterRootProps) {
  return <ArkSplitter.Root {...props} {...splitterRecipe({ variant })} />;
}

/**
 * Splitter — panels side by side (or stacked) that the user resizes by
 * dragging the boundary between them, or with the keyboard.
 *
 * Ark drives the machine: `panels` names each panel and its limits, each
 * size is a percentage, and each `ResizeTrigger` between two panels is a
 * `role="separator"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
 * and `aria-controls`. Arrow keys move it, Home and End push it to a limit,
 * and Enter collapses or expands a collapsible panel. The recipe only adds
 * the `variant` a consumer picks. Anatomy:
 * `Root > Panel + ResizeTrigger > ResizeTriggerIndicator + Panel …`. `Root` is
 * wrapped for the recipe; every other part is Ark's verbatim. The object is
 * annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Splitter: Omit<typeof ArkSplitter, "Root"> & { Root: typeof SplitterRoot } = {
  ...ArkSplitter,
  Root: SplitterRoot,
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
} from "@ark-ui/react";
