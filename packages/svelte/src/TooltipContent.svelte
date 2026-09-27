<!--
  Tooltip.Content carrying its Root's size as data-size, which components.css
  keys the padding, type and arrow off. Every prop passes straight through via
  `...rest`, and `bind:ref` reaches Ark's own bindable.
-->
<script lang="ts">
  import { Tooltip as ArkTooltip } from "@ark-ui/svelte";
  import type { TooltipContentProps } from "@ark-ui/svelte";
  import { tooltipRecipe } from "@moderno-ui/core";
  import { useTooltipSize } from "./tooltip-size.js";

  let { ref = $bindable(null), ...rest }: TooltipContentProps = $props();

  const size = useTooltipSize();
</script>

<ArkTooltip.Content bind:ref {...rest} {...tooltipRecipe({ size: size() })} />
