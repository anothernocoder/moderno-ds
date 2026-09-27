import { createContext, useContext } from "react";
import { Popover as ArkPopover } from "@ark-ui/react";
import type { PopoverContentProps, PopoverRootProps } from "@ark-ui/react";
import { popoverRecipe, type PopoverSize } from "@moderno-ui/core";

export type { PopoverSize } from "@moderno-ui/core";

export interface ModernoPopoverRootProps extends PopoverRootProps {
  /** Density of the content — resolves to `data-size` on the content part. */
  size?: PopoverSize;
}

/** The size a Root picked, read by its Content: Ark's Root renders no element to carry it. */
const PopoverSizeContext = createContext<PopoverSize | undefined>(undefined);

/** Popover.Root with the Moderno `size` recipe: it hands the size to its Content. */
function PopoverRoot({ size, ...props }: ModernoPopoverRootProps) {
  return (
    <PopoverSizeContext.Provider value={size}>
      <ArkPopover.Root {...props} />
    </PopoverSizeContext.Provider>
  );
}

/**
 * Popover.Content with the recipe's `data-size` from its Root, so
 * `components.css` sets the surface's density from it.
 */
function PopoverContent(props: PopoverContentProps) {
  const size = useContext(PopoverSizeContext);
  return <ArkPopover.Content {...props} {...popoverRecipe({ size })} />;
}

/**
 * Popover — a non-modal surface anchored to its trigger, with an optional
 * arrow, title, description and close button.
 *
 * Ark drives the machine: it places the content beside the trigger (flipping
 * and sliding to stay on screen), wires `aria-expanded` / `aria-controls`
 * on the trigger and `aria-labelledby` / `aria-describedby` on the
 * `role="dialog"` content, moves focus in on open and back on close, and
 * closes on Escape or a click outside. Anatomy:
 * `Root > Trigger + Positioner > Content > Arrow > ArrowTip, Title,
 * Description, CloseTrigger`. `Root` takes the `size` recipe and `Content`
 * carries it; every other part is Ark's verbatim. The object is annotated so
 * the emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Popover: Omit<typeof ArkPopover, "Root" | "Content"> & {
  Root: typeof PopoverRoot;
  Content: typeof PopoverContent;
} = {
  ...ArkPopover,
  Root: PopoverRoot,
  Content: PopoverContent,
};

export type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverIndicatorProps,
  PopoverAnchorProps,
  PopoverPositionerProps,
  PopoverContentProps,
  PopoverArrowProps,
  PopoverArrowTipProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseTriggerProps,
  PopoverOpenChangeDetails,
} from "@ark-ui/react";
