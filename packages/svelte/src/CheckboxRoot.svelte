<!--
  Checkbox.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css keys the box/label density off it. `children`
  and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Checkbox as ArkCheckbox } from "@ark-ui/svelte";
  import type { CheckboxRootProps } from "@ark-ui/svelte";
  import { checkboxRecipe, type CheckboxSize } from "@moderno-ui/core";

  let { size, ...rest }: CheckboxRootProps & { size?: CheckboxSize } = $props();
</script>

<ArkCheckbox.Root {...rest} {...checkboxRecipe({ size })} />
