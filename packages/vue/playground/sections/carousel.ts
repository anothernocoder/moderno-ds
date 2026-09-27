/**
 * Carousel — Ark's carousel machine: each root reaches the server as a region
 * with its named slides, the current indicator marked, and the trigger with
 * nowhere to go already disabled.
 */
import { h } from "vue";
import { Carousel } from "../../src/carousel.js";
import type { Section } from "../section.js";

// A Carousel's slides and controls: prev, one indicator per page, next.
const slidesAndControls = (slideCount: number, pageCount: number) => [
  h(Carousel.ItemGroup, null, () =>
    Array.from({ length: slideCount }, (_, index) =>
      h(Carousel.Item, { key: index, index }, () => `Slide ${index + 1}`),
    ),
  ),
  h(Carousel.Control, null, () => [
    h(Carousel.PrevTrigger, null, () => "‹"),
    h(Carousel.IndicatorGroup, null, () =>
      Array.from({ length: pageCount }, (_, index) => h(Carousel.Indicator, { key: index, index })),
    ),
    h(Carousel.NextTrigger, null, () => "›"),
  ]),
];

const CarouselSection: Section = () =>
  h("section", { "aria-label": "carousel" }, [
    h(Carousel.Root, { slideCount: 3 }, () => slidesAndControls(3, 3)),
    h(Carousel.Root, { size: "sm", slideCount: 4, slidesPerPage: 2, defaultPage: 1 }, () => [
      ...slidesAndControls(4, 2),
      h(Carousel.ProgressText),
    ]),
  ]);

export default CarouselSection;
