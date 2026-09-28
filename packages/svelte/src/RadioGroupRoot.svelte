<!--
  RadioGroup.Root with the Moderno recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the attributes of
  radioGroupAttrs (data-variant, data-size, data-columns, data-aspect-ratio)
  ride along and components.css keys the layout and density off them.
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { RadioGroup as ArkRadioGroup } from "@ark-ui/svelte";
  import type { RadioGroupRootProps } from "@ark-ui/svelte";
  import { radioGroupAttrs, type RadioGroupAttrsProps } from "@moderno-ui/core";

  let {
    variant,
    size,
    columns,
    aspectRatio,
    ...rest
  }: RadioGroupRootProps & RadioGroupAttrsProps = $props();
</script>

<ArkRadioGroup.Root {...rest} {...radioGroupAttrs({ variant, size, columns, aspectRatio })} />
