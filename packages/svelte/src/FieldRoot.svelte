<!--
  Field.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's data-size
  rides along and components.css sizes every part from that one attribute.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Field as ArkField } from "@ark-ui/svelte";
  import type { FieldRootProps } from "@ark-ui/svelte";
  import { fieldRecipe, type FieldSize } from "@moderno-ui/core";

  let { size, ...rest }: FieldRootProps & { size?: FieldSize } = $props();
</script>

<ArkField.Root {...rest} {...fieldRecipe({ size })} />
