<!--
  Menu.Root with the Moderno `size` folded in. Ark's Root renders no element,
  so the size travels down a context to the trigger and the content, which
  carry the recipe's data-size. A submenu's Root sits inside its parent's
  content, so it reads the parent's size when it sets none of its own.
  `bind:open` still reaches Ark; `children` and every other prop pass straight
  through via `...rest`.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import type { MenuRootProps } from "@ark-ui/svelte";
  import type { MenuSize } from "@moderno-ui/core";
  import { getMenuSize, setMenuSize } from "./menu-size.js";

  let {
    size,
    open = $bindable(),
    ...rest
  }: MenuRootProps & { open?: boolean; size?: MenuSize } = $props();

  const parentSize = getMenuSize();
  setMenuSize(() => size ?? parentSize());
</script>

<ArkMenu.Root bind:open {...rest} />
