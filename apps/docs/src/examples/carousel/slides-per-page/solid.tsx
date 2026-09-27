/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { Carousel } from "@moderno-ui/solid";

const slides = [1, 2, 3, 4, 5, 6];

export function CarouselSlidesPerPageDemo() {
  return (
    <Carousel.Root slideCount={slides.length} slidesPerPage={2} spacing="var(--spacing-3)">
      <Carousel.ItemGroup>
        <Index each={slides}>
          {(slide, index) => <Carousel.Item index={index}>{slide()}</Carousel.Item>}
        </Index>
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.Context>
          {(carousel) => (
            <Carousel.IndicatorGroup>
              <Index each={carousel().pageSnapPoints}>
                {(_, index) => <Carousel.Indicator index={index} />}
              </Index>
            </Carousel.IndicatorGroup>
          )}
        </Carousel.Context>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  );
}
