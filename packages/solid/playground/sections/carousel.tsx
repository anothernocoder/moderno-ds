/**
 * Carousel — Ark's carousel machine: the region and its named slides, the
 * current indicator and the triggers disabled at either end must reach the
 * server.
 */
import { Index } from "solid-js";
import { Carousel } from "../../src/carousel.jsx";
import type { Section } from "../section.js";

const CarouselSection: Section = () => (
  <section aria-label="carousel">
    <Carousel.Root slideCount={3}>
      <Carousel.ItemGroup>
        <Index each={[0, 1, 2]}>
          {(index) => <Carousel.Item index={index()}>Slide {index() + 1}</Carousel.Item>}
        </Index>
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          <Index each={[0, 1, 2]}>{(index) => <Carousel.Indicator index={index()} />}</Index>
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
    <Carousel.Root size="sm" slideCount={4} slidesPerPage={2} defaultPage={1}>
      <Carousel.ItemGroup>
        <Index each={[0, 1, 2, 3]}>
          {(index) => <Carousel.Item index={index()}>Slide {index() + 1}</Carousel.Item>}
        </Index>
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          <Index each={[0, 1]}>{(index) => <Carousel.Indicator index={index()} />}</Index>
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ProgressText />
    </Carousel.Root>
  </section>
);

export default CarouselSection;
