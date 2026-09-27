<script lang="ts">
  import { Carousel } from "@moderno-ui/svelte";

  const slides = [1, 2, 3, 4, 5];
</script>

<Carousel.Root slideCount={slides.length} autoplay>
  <Carousel.ItemGroup>
    {#each slides as slide, index (slide)}
      <Carousel.Item {index}>{slide}</Carousel.Item>
    {/each}
  </Carousel.ItemGroup>
  <Carousel.Control>
    <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
    <Carousel.AutoplayTrigger>
      <Carousel.AutoplayIndicator>
        {#snippet fallback()}Play{/snippet}
        Pause
      </Carousel.AutoplayIndicator>
    </Carousel.AutoplayTrigger>
    <Carousel.NextTrigger>›</Carousel.NextTrigger>
  </Carousel.Control>
</Carousel.Root>
