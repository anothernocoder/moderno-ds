<!--
  Progress.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's attribute
  rides along and components.css sizes the parts from it. `children` and
  every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Progress as ArkProgress } from "@ark-ui/svelte";
  import type { ProgressRootProps } from "@ark-ui/svelte";
  import { progressRecipe, type ProgressSize } from "@moderno-ui/core";

  let { size, ...rest }: ProgressRootProps & { size?: ProgressSize } = $props();
</script>

<ArkProgress.Root {...rest} {...progressRecipe({ size })} />
