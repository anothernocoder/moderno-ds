<!--
  Slider.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's attribute
  rides along and components.css sizes the parts from it. `children` and
  every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Slider as ArkSlider } from "@ark-ui/svelte";
  import type { SliderRootProps } from "@ark-ui/svelte";
  import { sliderRecipe, type SliderSize } from "@moderno-ui/core";

  let { size, ...rest }: SliderRootProps & { size?: SliderSize } = $props();
</script>

<ArkSlider.Root {...rest} {...sliderRecipe({ size })} />
