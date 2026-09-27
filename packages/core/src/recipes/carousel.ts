import { cva, type VariantProps } from "../cva.js";

/**
 * Carousel: `size` on the root — the size of the prev/next and autoplay
 * triggers, the indicator dots and the progress text. The slide count, the
 * page, slides per page, spacing, loop, orientation and autoplay are Ark's
 * own props; the current indicator surfaces as Ark's `data-current`, a slide
 * in view as `data-inview`, and a trigger with nowhere to go is disabled by
 * Ark.
 */
export const carouselRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** Carousel's density (trigger and indicator size, type), shared by every control. */
export type CarouselSize = NonNullable<VariantProps<typeof carouselRecipe.variants>["size"]>;

/** The media query a reader sets to ask for less motion on screen. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** What a Carousel does on its own: Ark's `autoplay` and `loop` props. */
export interface CarouselMotion<Autoplay> {
  autoplay?: Autoplay | false;
  loop?: boolean;
}

/**
 * The `autoplay` and `loop` a Carousel hands to Ark. They are the consumer's
 * own, unless the reader asked for reduced motion: then `autoplay` is
 * `false`, so the slides never move on their own (the reader can still start
 * them with the AutoplayTrigger). `loop` keeps Ark's default — on when the
 * consumer asked for autoplay — so holding autoplay back never changes it.
 */
export function carouselMotion<Autoplay>(
  { autoplay, loop }: CarouselMotion<Autoplay>,
  prefersReducedMotion: boolean,
): CarouselMotion<Autoplay> {
  return {
    autoplay: prefersReducedMotion ? false : autoplay,
    loop: loop ?? Boolean(autoplay),
  };
}
