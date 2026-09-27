<!--
  Drawer.CloseTrigger — Ark's Dialog.CloseTrigger (closes the drawer) under the "drawer" scope.
  Every prop passes straight through via `...rest`, and `bind:ref` reaches
  Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogCloseTriggerProps } from "@ark-ui/svelte";
  import { DRAWER_SCOPE } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogCloseTriggerProps = $props();
</script>

<ArkDialog.CloseTrigger bind:ref {...rest} {...DRAWER_SCOPE} />
