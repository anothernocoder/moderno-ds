import { Tooltip as ArkTooltip } from "@ark-ui/svelte";
import TooltipRoot from "../TooltipRoot.svelte";
import TooltipContent from "../TooltipContent.svelte";

/**
 * Tooltip — a short label that shows while the pointer rests on its trigger
 * or the trigger has keyboard focus, with an arrow pointing at it. Ark drives
 * the delays, Escape, the placement and the arrow, `aria-describedby` on the
 * trigger and the `tooltip` role on the content. Anatomy: `Root > Trigger +
 * Positioner > Content > Arrow > ArrowTip`, the positioner usually in a
 * `Portal`. `Root` and `Content` are wrapped for the `size` recipe; every
 * other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Tooltip: Omit<typeof ArkTooltip, "Root" | "Content"> & {
  Root: typeof TooltipRoot;
  Content: typeof TooltipContent;
} = {
  ...ArkTooltip,
  Root: TooltipRoot,
  Content: TooltipContent,
};
export type { TooltipSize } from "@moderno-ui/core";
export type { TooltipOpenChangeDetails } from "@ark-ui/svelte";
