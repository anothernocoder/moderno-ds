<!--
  RadioGroup.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css keys the circle and text density off it.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { RadioGroup as ArkRadioGroup } from "@ark-ui/svelte";
  import type { RadioGroupRootProps } from "@ark-ui/svelte";
  import { radioGroupRecipe, type RadioGroupSize } from "@moderno-ui/core";

  let { size, ...rest }: RadioGroupRootProps & { size?: RadioGroupSize } = $props();
</script>

<ArkRadioGroup.Root {...rest} {...radioGroupRecipe({ size })} />
