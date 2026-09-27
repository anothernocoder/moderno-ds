<script lang="ts">
  import { Carousel } from "@moderno-ui/svelte";

  const slides = [1, 2, 3, 4, 5, 6];
</script>

<Carousel.Root slideCount={slides.length} slidesPerPage={2} spacing="var(--spacing-3)">
  <Carousel.ItemGroup>
    {#each slides as slide, index (slide)}
      <Carousel.Item {index}>{slide}</Carousel.Item>
    {/each}
  </Carousel.ItemGroup>
  <Carousel.Control>
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
</Carousel.Root>
