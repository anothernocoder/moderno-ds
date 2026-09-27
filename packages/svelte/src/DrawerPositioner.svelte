<!--
  Drawer.Positioner — Ark's Dialog.Positioner (pins the content to the Root's edge) under the "drawer" scope,
  carrying its Root's placement as data-placement. Every prop passes
  straight through via `...rest`, and `bind:ref` reaches Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogPositionerProps } from "@ark-ui/svelte";
  import { drawerRecipe } from "@moderno-ui/core";
  import { DRAWER_SCOPE, getDrawerPlacement } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogPositionerProps = $props();

  const placement = getDrawerPlacement();
</script>

<ArkDialog.Positioner bind:ref {...rest} {...DRAWER_SCOPE} {...drawerRecipe({ placement: placement() })} />
