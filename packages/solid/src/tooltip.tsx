import {
  createContext,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
} from "solid-js";
import { Tooltip as ArkTooltip } from "@ark-ui/solid";
import type { TooltipRootProps } from "@ark-ui/solid";
import { tooltipRecipe, type TooltipSize } from "@moderno-ui/core";

export type { TooltipSize } from "@moderno-ui/core";

export type ModernoTooltipRootProps = TooltipRootProps & {
  /** Padding, type and arrow of the content — resolves to `data-size` on the content part. */
  size?: TooltipSize;
};

/** The size a Tooltip.Root hands down to its Content, read as an accessor. */
const TooltipSizeContext = createContext<Accessor<TooltipSize | undefined>>(() => undefined);

/**
 * Tooltip.Root with the Moderno `size` recipe folded in. Ark's Root renders
 * no element, so the size travels down to the Content, the surface.
 */
function TooltipRoot(props: ModernoTooltipRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return (
    <TooltipSizeContext.Provider value={() => local.size}>
      <ArkTooltip.Root {...rest} />
    </TooltipSizeContext.Provider>
  );
}

/**
 * Tooltip.Content carrying its Root's size as `data-size`, which
 * `components.css` keys the padding, type and arrow off.
 */
function TooltipContent(props: ComponentProps<typeof ArkTooltip.Content>) {
  const size = useContext(TooltipSizeContext);
  return <ArkTooltip.Content {...props} {...tooltipRecipe({ size: size() })} />;
}

/**
 * Tooltip — a short label that shows while the pointer rests on its trigger
 * or the trigger has keyboard focus, with an arrow pointing at it. Ark drives
 * the delays, Escape, the placement and the arrow, `aria-describedby` on the
 * trigger and the `tooltip` role on the content. Anatomy: `Root > Trigger +
 * Positioner > Content > Arrow > ArrowTip`, the positioner usually in a
 * `Portal`. `Root` and `Content` are wrapped for the size; every other part is
 * Ark's verbatim. The object is annotated so the emitted `.d.ts` doesn't
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

export type {
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPositionerProps,
  TooltipContentProps,
  TooltipArrowProps,
  TooltipArrowTipProps,
  TooltipOpenChangeDetails,
} from "@ark-ui/solid";
