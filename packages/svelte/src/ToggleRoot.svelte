<!--
  Toggle.Root with the Moderno `variant` × `size` recipe folded in. Ark's Root
  spreads unknown props onto its <button data-part="root">, so the recipe's
  data-variant/data-size ride along for components.css. `children` and every
  other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Toggle as ArkToggle } from "@ark-ui/svelte";
  import type { ToggleRootProps } from "@ark-ui/svelte";
  import { toggleRecipe, type ToggleSize, type ToggleVariant } from "@moderno-ui/core";

  let {
    variant,
    size,
    ...rest
  }: ToggleRootProps & { variant?: ToggleVariant; size?: ToggleSize } = $props();
</script>

<ArkToggle.Root {...rest} {...toggleRecipe({ variant, size })} />
