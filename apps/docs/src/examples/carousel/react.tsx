import { Carousel } from "@moderno-ui/react";

const slides = [1, 2, 3, 4, 5];

export function CarouselDemo() {
  return (
    <Carousel.Root slideCount={slides.length}>
      <Carousel.ItemGroup>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide} index={index}>
            {slide}
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          {slides.map((slide, index) => (
            <Carousel.Indicator key={slide} index={index} />
          ))}
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  );
}
