<!--
  Carousel.Root with the Moderno `size` recipe folded in, and autoplay held
  off while the reader prefers reduced motion. Ark's Root spreads unknown
  props onto its data-part="root" element, so the recipe's attribute rides
  along and components.css sizes the controls from it. `children` and every
  other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Carousel as ArkCarousel } from "@ark-ui/svelte";
  import type { CarouselRootProps } from "@ark-ui/svelte";
  import {
    REDUCED_MOTION_QUERY,
    carouselMotion,
    carouselRecipe,
    type CarouselSize,
  } from "@moderno-ui/core";

  let {
    size,
    autoplay,
    loop,
    ...rest
  }: CarouselRootProps & { size?: CarouselSize } = $props();

  // `false` on the server and until the client mounts, so the hydrated markup
  // matches; then it follows the media query.
  let prefersReducedMotion = $state(false);
  $effect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => (prefersReducedMotion = query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  });
</script>

<ArkCarousel.Root
  {...rest}
  {...carouselMotion({ autoplay, loop }, prefersReducedMotion)}
  {...carouselRecipe({ size })}
/>
