<!--
  Popover.Root with the Moderno `size` recipe: Ark's Root renders no element,
  so it hands the size to its Content through context. `open` stays bindable
  (`bind:open`), and `children` and every other prop pass straight through
  via `...rest`.
-->
<script lang="ts">
  import { Popover as ArkPopover } from "@ark-ui/svelte";
  import type { PopoverRootProps } from "@ark-ui/svelte";
  import type { PopoverSize } from "@moderno-ui/core";
  import { setPopoverSize } from "./popover-size.js";

  let {
    size,
    open = $bindable(),
    ...rest
  }: PopoverRootProps & { size?: PopoverSize } = $props();

  setPopoverSize(() => size);
</script>

<ArkPopover.Root bind:open {...rest} />
