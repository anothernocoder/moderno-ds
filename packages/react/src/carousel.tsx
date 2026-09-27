import { useSyncExternalStore } from "react";
import { Carousel as ArkCarousel } from "@ark-ui/react";
import type { CarouselRootProps } from "@ark-ui/react";
import {
  REDUCED_MOTION_QUERY,
  carouselMotion,
  carouselRecipe,
  type CarouselSize,
} from "@moderno-ui/core";

export type { CarouselSize } from "@moderno-ui/core";

export interface ModernoCarouselRootProps extends CarouselRootProps {
  /** Size of the triggers, the indicator dots and the progress text — resolves to `data-size` on the root part. */
  size?: CarouselSize;
}

function subscribeToReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the reader asked for reduced motion. The server and the hydrating
 * client both read `false`, so the markup matches; React re-renders with the
 * real answer right after hydration.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Carousel.Root with the Moderno `size` recipe folded in, and autoplay held
 * off while the reader prefers reduced motion. Ark's Root spreads unknown
 * props onto its `data-part="root"` element, so the recipe's attribute rides
 * along and `components.css` sizes the controls from it.
 */
function CarouselRoot({ size, autoplay, loop, ...props }: ModernoCarouselRootProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <ArkCarousel.Root
      {...props}
      {...carouselMotion({ autoplay, loop }, prefersReducedMotion)}
      {...carouselRecipe({ size })}
    />
  );
}

/**
 * Carousel — slides that scroll one page at a time, with prev/next triggers
 * and one indicator per page.
 *
 * Ark drives the machine: `slideCount` slides, `slidesPerPage` of them on a
 * page; the item group scrolls and snaps to each page; the current
 * indicator carries `data-current`; prev/next are disabled at either end
 * unless the carousel loops. The recipe only adds the `size` a consumer
 * picks. Anatomy: `Root > ItemGroup > Item…` and `Control > PrevTrigger +
 * IndicatorGroup > Indicator… + NextTrigger`, with `AutoplayTrigger` and
 * `ProgressText` where they fit. `Root` is wrapped; every other part is
 * Ark's verbatim. The object is annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Carousel: Omit<typeof ArkCarousel, "Root"> & {
  Root: typeof CarouselRoot;
} = {
  ...ArkCarousel,
  Root: CarouselRoot,
};

export type {
  CarouselRootProps,
  CarouselItemGroupProps,
  CarouselItemProps,
  CarouselControlProps,
  CarouselPrevTriggerProps,
  CarouselNextTriggerProps,
  CarouselIndicatorGroupProps,
  CarouselIndicatorProps,
  CarouselAutoplayTriggerProps,
  CarouselAutoplayIndicatorProps,
  CarouselProgressTextProps,
  CarouselPageChangeDetails,
  CarouselAutoplayStatusDetails,
  CarouselDragStatusDetails,
} from "@ark-ui/react";
