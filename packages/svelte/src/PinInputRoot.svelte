<!--
  PinInput.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css keys the cell density off it. `children` and
  every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { PinInput as ArkPinInput } from "@ark-ui/svelte";
  import type { PinInputRootProps } from "@ark-ui/svelte";
  import { pinInputRecipe, type PinInputSize } from "@moderno-ui/core";

  let { size, ...rest }: PinInputRootProps & { size?: PinInputSize } = $props();
</script>

<ArkPinInput.Root {...rest} {...pinInputRecipe({ size })} />
