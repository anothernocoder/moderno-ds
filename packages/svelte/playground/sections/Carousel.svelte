<!--
  Carousel — Ark's carousel machine: the region and its named slides, the
  current indicator and the triggers disabled at either end reach the server
  string.
-->
<script lang="ts">
  import { Carousel } from "../../src/exports/carousel.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="carousel">
  <Carousel.Root slideCount={3}>
    <Carousel.ItemGroup>
      {#each [0, 1, 2] as index (index)}
        <Carousel.Item {index}>Slide {index + 1}</Carousel.Item>
      {/each}
    </Carousel.ItemGroup>
    <Carousel.Control>
      <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
      <Carousel.IndicatorGroup>
        {#each [0, 1, 2] as index (index)}
          <Carousel.Indicator {index} />
        {/each}
      </Carousel.IndicatorGroup>
      <Carousel.NextTrigger>›</Carousel.NextTrigger>
    </Carousel.Control>
  </Carousel.Root>
  <Carousel.Root size="sm" slideCount={4} slidesPerPage={2} defaultPage={1}>
    <Carousel.ItemGroup>
      {#each [0, 1, 2, 3] as index (index)}
        <Carousel.Item {index}>Slide {index + 1}</Carousel.Item>
      {/each}
    </Carousel.ItemGroup>
    <Carousel.Control>
      <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
      <Carousel.IndicatorGroup>
        {#each [0, 1] as index (index)}
          <Carousel.Indicator {index} />
        {/each}
      </Carousel.IndicatorGroup>
      <Carousel.NextTrigger>›</Carousel.NextTrigger>
    </Carousel.Control>
    <Carousel.ProgressText />
  </Carousel.Root>
</section>
