<!--
  Menu.Trigger with the menu's data-size, for its height and type size.
  `children` and every other prop pass straight through.
-->
<script lang="ts">
  import { Menu as ArkMenu } from "@ark-ui/svelte";
  import type { MenuTriggerProps } from "@ark-ui/svelte";
  import { menuRecipe } from "@moderno-ui/core";
  import { getMenuSize } from "./menu-size.js";

  let props: MenuTriggerProps = $props();
  const size = getMenuSize();
</script>

<ArkMenu.Trigger {...props} {...menuRecipe({ size: size() })} />
