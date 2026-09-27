import { Carousel } from "@moderno-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const slides = [1, 2, 3];

export function CarouselSizesDemo() {
  return (
    <div className="demo-stack">
      {sizes.map((size) => (
        <Carousel.Root key={size} size={size} slideCount={slides.length}>
          <Carousel.ItemGroup>
            {slides.map((slide, index) => (
              <Carousel.Item key={slide} index={index}>
                {size}
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
      ))}
    </div>
  );
}
