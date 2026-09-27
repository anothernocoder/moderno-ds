import { createSignal, onCleanup, splitProps, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";
import { Carousel as ArkCarousel } from "@ark-ui/solid";
import type { CarouselRootProps } from "@ark-ui/solid";
import {
  REDUCED_MOTION_QUERY,
  carouselMotion,
  carouselRecipe,
  type CarouselSize,
} from "@moderno-ui/core";

export type { CarouselSize } from "@moderno-ui/core";

export type ModernoCarouselRootProps = CarouselRootProps & {
  /** Size of the triggers, the indicator dots and the progress text — resolves to `data-size` on the root part. */
  size?: CarouselSize;
};

/**
 * Whether the reader asked for reduced motion; `false` on the server. The
 * client reads it as the Root is created, not on mount: Ark's Solid machine
 * starts from the props it is created with and misses a change made before it
 * tracks them. Solid's hydration sets the spread attributes again, so the
 * server's markup is corrected in place.
 */
function createPrefersReducedMotion(): Accessor<boolean> {
  const query = isServer ? undefined : window.matchMedia(REDUCED_MOTION_QUERY);
  const [prefersReducedMotion, setPrefersReducedMotion] = createSignal(query?.matches ?? false);
  if (query) {
    const update = () => setPrefersReducedMotion(query.matches);
    query.addEventListener("change", update);
    onCleanup(() => query.removeEventListener("change", update));
  }
  return prefersReducedMotion;
}

/**
 * Carousel.Root with the Moderno `size` recipe folded in, and autoplay held
 * off while the reader prefers reduced motion. Ark's Root spreads unknown
 * props onto its `data-part="root"` element, so the recipe's attribute rides
 * along and `components.css` sizes the controls from it.
 */
function CarouselRoot(props: ModernoCarouselRootProps) {
  const [local, rest] = splitProps(props, ["size", "autoplay", "loop"]);
  const prefersReducedMotion = createPrefersReducedMotion();
  const motion = () =>
    carouselMotion({ autoplay: local.autoplay, loop: local.loop }, prefersReducedMotion());
  return (
    <ArkCarousel.Root
      {...rest}
      autoplay={motion().autoplay}
      loop={motion().loop}
      {...carouselRecipe({ size: local.size })}
    />
  );
}

/**
 * Carousel — slides that scroll one page at a time, with prev/next triggers
 * and one indicator per page. Ark drives all of it: `slideCount` slides,
 * `slidesPerPage` of them on a page; the item group scrolls and snaps to each
 * page; the current indicator carries `data-current`; prev/next are disabled
 * at either end unless the carousel loops. `Root` is wrapped to inject the
 * recipe and hold autoplay under reduced motion; every other part is Ark's
 * verbatim. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
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
} from "@ark-ui/solid";
