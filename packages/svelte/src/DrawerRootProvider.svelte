<!--
  Drawer.RootProvider — Ark's Dialog.RootProvider (driven by `useDialog()`)
  with the same `placement` recipe as Drawer.Root.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogRootProviderProps } from "@ark-ui/svelte";
  import type { DrawerPlacement } from "@moderno-ui/core";
  import { setDrawerPlacement } from "./drawer-placement.js";

  let { placement, ...rest }: DialogRootProviderProps & { placement?: DrawerPlacement } = $props();

  setDrawerPlacement(() => placement);
</script>

<ArkDialog.RootProvider {...rest} />
