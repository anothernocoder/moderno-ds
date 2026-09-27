<script lang="ts">
  import { Carousel } from "@moderno-ui/svelte";

  const slides = [1, 2, 3, 4, 5];
</script>

<Carousel.Root slideCount={slides.length}>
  <Carousel.ItemGroup>
    {#each slides as slide, index (slide)}
      <Carousel.Item {index}>{slide}</Carousel.Item>
    {/each}
  </Carousel.ItemGroup>
  <Carousel.Control>
    <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
    <Carousel.IndicatorGroup>
      {#each slides as slide, index (slide)}
        <Carousel.Indicator {index} />
      {/each}
    </Carousel.IndicatorGroup>
    <Carousel.NextTrigger>›</Carousel.NextTrigger>
  </Carousel.Control>
</Carousel.Root>
