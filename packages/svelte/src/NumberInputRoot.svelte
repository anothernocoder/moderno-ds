<!--
  NumberInput.Root with the Moderno `size` recipe folded in. Ark's Root
  spreads unknown props onto its data-part="root" element, so the recipe's
  attribute rides along and components.css sizes the parts from it.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { NumberInput as ArkNumberInput } from "@ark-ui/svelte";
  import type { NumberInputRootProps } from "@ark-ui/svelte";
  import { numberInputRecipe, type NumberInputSize } from "@moderno-ui/core";

  let { size, ...rest }: NumberInputRootProps & { size?: NumberInputSize } = $props();
</script>

<ArkNumberInput.Root {...rest} {...numberInputRecipe({ size })} />
