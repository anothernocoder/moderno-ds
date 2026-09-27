import { Carousel as ArkCarousel } from "@ark-ui/svelte";
import CarouselRoot from "../CarouselRoot.svelte";

/**
 * Carousel — slides that scroll one page at a time, with prev/next triggers
 * and one indicator per page. Ark drives all of it: `slideCount` slides,
 * `slidesPerPage` of them on a page; the item group scrolls and snaps to each
 * page; the current indicator carries `data-current`; prev/next are disabled
 * at either end unless the carousel loops. `Root` is wrapped to inject the
 * `size` recipe and hold autoplay under reduced motion; every other part is
 * Ark's verbatim. Annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Carousel: Omit<typeof ArkCarousel, "Root"> & { Root: typeof CarouselRoot } = {
  ...ArkCarousel,
  Root: CarouselRoot,
};
export type { CarouselSize } from "@moderno-ui/core";
export type {
  CarouselPageChangeDetails,
  CarouselAutoplayStatusDetails,
  CarouselDragStatusDetails,
} from "@ark-ui/svelte";
