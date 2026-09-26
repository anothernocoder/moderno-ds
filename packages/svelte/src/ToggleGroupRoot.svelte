<!--
  ToggleGroup.Root with the Moderno `variant` × `size` recipe folded in. Ark's
  Root spreads unknown props onto its data-part="root" element, so the
  recipe's attributes ride along and components.css styles every item from
  them. `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { ToggleGroup as ArkToggleGroup } from "@ark-ui/svelte";
  import type { ToggleGroupRootProps } from "@ark-ui/svelte";
  import {
    toggleGroupRecipe,
    type ToggleGroupSize,
    type ToggleGroupVariant,
  } from "@moderno-ui/core";

  let {
    variant,
    size,
    ...rest
  }: ToggleGroupRootProps & { variant?: ToggleGroupVariant; size?: ToggleGroupSize } = $props();
</script>

<ArkToggleGroup.Root {...rest} {...toggleGroupRecipe({ variant, size })} />
