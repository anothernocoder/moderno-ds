import { Carousel } from "@moderno-ui/react";

const slides = [1, 2, 3, 4, 5];

export function CarouselAutoplayDemo() {
  return (
    <Carousel.Root slideCount={slides.length} autoplay>
      <Carousel.ItemGroup>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide} index={index}>
            {slide}
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.AutoplayTrigger>
          <Carousel.AutoplayIndicator fallback="Play">Pause</Carousel.AutoplayIndicator>
        </Carousel.AutoplayTrigger>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  );
}
