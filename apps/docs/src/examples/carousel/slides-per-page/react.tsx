import { Carousel } from "@moderno-ui/react";

const slides = [1, 2, 3, 4, 5, 6];

export function CarouselSlidesPerPageDemo() {
  return (
    <Carousel.Root slideCount={slides.length} slidesPerPage={2} spacing="var(--spacing-3)">
      <Carousel.ItemGroup>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide} index={index}>
            {slide}
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.Context>
          {(carousel) => (
            <Carousel.IndicatorGroup>
              {carousel.pageSnapPoints.map((_, index) => (
                <Carousel.Indicator key={index} index={index} />
              ))}
            </Carousel.IndicatorGroup>
          )}
        </Carousel.Context>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  );
}
