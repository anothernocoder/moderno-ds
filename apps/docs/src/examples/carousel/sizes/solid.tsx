/** @jsxImportSource solid-js */
import { For, Index } from "solid-js";
import { Carousel } from "@moderno-ui/solid";

const sizes = ["sm", "md", "lg"] as const;
const slides = [1, 2, 3];

export function CarouselSizesDemo() {
  return (
    <div class="demo-stack">
      <For each={sizes}>
        {(size) => (
          <Carousel.Root size={size} slideCount={slides.length}>
            <Carousel.ItemGroup>
              <Index each={slides}>
                {(_, index) => <Carousel.Item index={index}>{size}</Carousel.Item>}
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
        )}
      </For>
    </div>
  );
}
