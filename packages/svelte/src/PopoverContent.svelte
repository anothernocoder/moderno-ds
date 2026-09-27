<!--
  Popover.Content with the recipe's data-size from its Root, so components.css
  sets the surface's density from it. `children` and every other prop pass
  straight through via `...rest`.
-->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import type { PopoverContentProps } from "@ark-ui/svelte";
  import { popoverRecipe } from "@moderno-ui/core";
  import { getPopoverSize } from "./popover-size.js";

  let props: PopoverContentProps = $props();

  const size = getPopoverSize();
</script>

<ArkPopover.Content {...props} {...popoverRecipe({ size: size() })} />
