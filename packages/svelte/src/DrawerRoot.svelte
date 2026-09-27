<!--
  Drawer.Root — Ark's Dialog.Root with the Moderno `placement` recipe: Ark's
  Root renders no element, so it hands the placement to its Positioner and
  Content through context. `open` stays bindable (`bind:open`), and
  `children` and every other prop pass straight through via `...rest`.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogRootProps } from "@ark-ui/svelte";
  import type { DrawerPlacement } from "@moderno-ui/core";
  import { setDrawerPlacement } from "./drawer-placement.js";

  let {
    placement,
    open = $bindable(),
    ...rest
  }: DialogRootProps & { placement?: DrawerPlacement } = $props();

  setDrawerPlacement(() => placement);
</script>

<ArkDialog.Root bind:open {...rest} />
