<!--
  Drawer.Backdrop — Ark's Dialog.Backdrop (the scrim behind the drawer) under the "drawer" scope.
  Every prop passes straight through via `...rest`, and `bind:ref` reaches
  Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogBackdropProps } from "@ark-ui/svelte";
  import { DRAWER_SCOPE } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogBackdropProps = $props();
</script>

<ArkDialog.Backdrop bind:ref {...rest} {...DRAWER_SCOPE} />
