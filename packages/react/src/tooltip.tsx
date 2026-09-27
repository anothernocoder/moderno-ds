import { createContext, useContext, type ComponentProps } from "react";
import { Tooltip as ArkTooltip } from "@ark-ui/react";
import type { TooltipRootProps } from "@ark-ui/react";
import { tooltipRecipe, type TooltipSize } from "@moderno-ui/core";

export type { TooltipSize } from "@moderno-ui/core";

export interface ModernoTooltipRootProps extends TooltipRootProps {
  /** Padding, type and arrow of the content — resolves to `data-size` on the content part. */
  size?: TooltipSize;
}

/** The size a Tooltip.Root hands down to its Content. */
const TooltipSizeContext = createContext<TooltipSize | undefined>(undefined);

/**
 * Tooltip.Root with the Moderno `size` recipe folded in. Ark's Root renders
 * no element, so the size travels down to the Content, the surface.
 */
function TooltipRoot({ size, ...props }: ModernoTooltipRootProps) {
  return (
    <TooltipSizeContext.Provider value={size}>
      <ArkTooltip.Root {...props} />
    </TooltipSizeContext.Provider>
  );
}

/**
 * Tooltip.Content carrying its Root's size as `data-size`, which
 * `components.css` keys the padding, type and arrow off. A ref passes through
 * with the other props (React 19).
 */
function TooltipContent(props: ComponentProps<typeof ArkTooltip.Content>) {
  const size = useContext(TooltipSizeContext);
  return <ArkTooltip.Content {...props} {...tooltipRecipe({ size })} />;
}

/**
 * Tooltip — a short label that shows while the pointer rests on its trigger
 * or the trigger has keyboard focus, with an arrow pointing at it.
 *
 * Ark drives the machine: the open and close delays, Escape, the placement
 * and the arrow's position, `aria-describedby` on the trigger and the
 * `tooltip` role on the content. Anatomy: `Root > Trigger + Positioner >
 * Content > Arrow > ArrowTip`, the positioner usually in a `Portal`. `Root`
 * and `Content` are wrapped for the size; every other part is Ark's
 * verbatim. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Tooltip: Omit<typeof ArkTooltip, "Root" | "Content"> & {
  Root: typeof TooltipRoot;
  Content: typeof TooltipContent;
} = {
  ...ArkTooltip,
  Root: TooltipRoot,
  Content: TooltipContent,
};

export type {
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPositionerProps,
  TooltipContentProps,
  TooltipArrowProps,
  TooltipArrowTipProps,
  TooltipOpenChangeDetails,
} from "@ark-ui/react";
