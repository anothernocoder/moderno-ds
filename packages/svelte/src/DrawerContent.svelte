<!--
  Drawer.Content — Ark's Dialog.Content (the panel) under the "drawer" scope,
  carrying its Root's placement as data-placement. Every prop passes
  straight through via `...rest`, and `bind:ref` reaches Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogContentProps } from "@ark-ui/svelte";
  import { drawerRecipe } from "@moderno-ui/core";
  import { DRAWER_SCOPE, getDrawerPlacement } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogContentProps = $props();

  const placement = getDrawerPlacement();
</script>

<ArkDialog.Content bind:ref {...rest} {...DRAWER_SCOPE} {...drawerRecipe({ placement: placement() })} />
