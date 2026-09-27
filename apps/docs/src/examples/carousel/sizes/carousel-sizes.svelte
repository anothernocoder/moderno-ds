<script lang="ts">
  import { Carousel } from "@moderno-ui/svelte";

  const sizes = ["sm", "md", "lg"] as const;
  const slides = [1, 2, 3];
</script>

<div class="demo-stack">
  {#each sizes as size (size)}
    <Carousel.Root {size} slideCount={slides.length}>
      <Carousel.ItemGroup>
        {#each slides as slide, index (slide)}
          <Carousel.Item {index}>{size}</Carousel.Item>
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
  {/each}
</div>
