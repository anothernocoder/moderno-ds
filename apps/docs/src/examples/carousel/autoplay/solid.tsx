/** @jsxImportSource solid-js */
import { Index } from "solid-js";
import { Carousel } from "@moderno-ui/solid";

const slides = [1, 2, 3, 4, 5];

export function CarouselAutoplayDemo() {
  return (
    <Carousel.Root slideCount={slides.length} autoplay>
      <Carousel.ItemGroup>
        <Index each={slides}>
          {(slide, index) => <Carousel.Item index={index}>{slide()}</Carousel.Item>}
        </Index>
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
