<!--
  Switch.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css keys the track, thumb and label density off
  it. `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Switch as ArkSwitch } from "@ark-ui/svelte";
  import type { SwitchRootProps } from "@ark-ui/svelte";
  import { switchRecipe, type SwitchSize } from "@moderno-ui/core";

  let { size, ...rest }: SwitchRootProps & { size?: SwitchSize } = $props();
</script>

<ArkSwitch.Root {...rest} {...switchRecipe({ size })} />
