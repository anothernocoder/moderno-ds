/**
 * Carousel — Ark's carousel machine: the region and its named slides, the
 * current indicator and the triggers disabled at either end must match both
 * ways.
 */
import { Carousel } from "../../src/carousel.js";
import type { Section } from "../section.js";

const CarouselSection: Section = () => (
  <section aria-label="carousel">
    <Carousel.Root slideCount={3}>
      <Carousel.ItemGroup>
        {[0, 1, 2].map((index) => (
          <Carousel.Item key={index} index={index}>
            Slide {index + 1}
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          {[0, 1, 2].map((index) => (
            <Carousel.Indicator key={index} index={index} />
          ))}
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
    <Carousel.Root size="sm" slideCount={4} slidesPerPage={2} defaultPage={1}>
      <Carousel.ItemGroup>
        {[0, 1, 2, 3].map((index) => (
          <Carousel.Item key={index} index={index}>
            Slide {index + 1}
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          {[0, 1].map((index) => (
            <Carousel.Indicator key={index} index={index} />
          ))}
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ProgressText />
    </Carousel.Root>
  </section>
);

export default CarouselSection;
