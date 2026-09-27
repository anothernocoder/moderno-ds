/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { Carousel } from "@moderno-ui/solid";

const slides = [1, 2, 3, 4, 5];

export function CarouselDemo() {
  return (
    <Carousel.Root slideCount={slides.length}>
      <Carousel.ItemGroup>
        <Index each={slides}>
          {(slide, index) => <Carousel.Item index={index}>{slide()}</Carousel.Item>}
        </Index>
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          <Index each={slides}>{(_, index) => <Carousel.Indicator index={index} />}</Index>
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  );
}
