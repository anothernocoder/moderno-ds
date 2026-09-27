<!--
  Menu.Content with the menu's data-size, for the items' density.
  `children` and every other prop pass straight through.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import type { MenuContentProps } from "@ark-ui/svelte";
  import { menuRecipe } from "@moderno-ui/core";
  import { getMenuSize } from "./menu-size.js";

  let props: MenuContentProps = $props();
  const size = getMenuSize();
</script>

<ArkMenu.Content {...props} {...menuRecipe({ size: size() })} />
