<script lang="ts">
  import { Carousel } from "../../src/index.js";
  import type { CarouselSize, CarouselPageChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    slideCount = 3,
    slidesPerPage = undefined,
    page = undefined,
    defaultPage = undefined,
    loop = undefined,
    autoplay = undefined,
    onPageChange = undefined,
  }: {
    size?: CarouselSize;
    slideCount?: number;
    slidesPerPage?: number;
    page?: number;
    defaultPage?: number;
    loop?: boolean;
    autoplay?: boolean;
    onPageChange?: (details: CarouselPageChangeDetails) => void;
  } = $props();
</script>

<Carousel.Root
  {size}
  {slideCount}
  {slidesPerPage}
  {page}
  {defaultPage}
  {loop}
  {autoplay}
  {onPageChange}
  class="slides"
>
  <Carousel.ItemGroup>
    {#each Array.from({ length: slideCount }, (_, index) => index) as index (index)}
      <Carousel.Item {index}>Slide {index + 1}</Carousel.Item>
    {/each}
  </Carousel.ItemGroup>
  <Carousel.Control>
    <Carousel.AutoplayTrigger>▶</Carousel.AutoplayTrigger>
    <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
    <Carousel.Context>
      {#snippet render(carousel)}
        <Carousel.IndicatorGroup>
          {#each carousel().pageSnapPoints as _, index (index)}
            <Carousel.Indicator {index} />
          {/each}
        </Carousel.IndicatorGroup>
      {/snippet}
    </Carousel.Context>
    <Carousel.NextTrigger>›</Carousel.NextTrigger>
  </Carousel.Control>
  <Carousel.ProgressText />
</Carousel.Root>
