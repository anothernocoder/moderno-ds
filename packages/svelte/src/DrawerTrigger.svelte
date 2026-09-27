<!--
  Drawer.Trigger — Ark's Dialog.Trigger (opens the drawer) under the "drawer" scope.
  Every prop passes straight through via `...rest`, and `bind:ref` reaches
  Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogTriggerProps } from "@ark-ui/svelte";
  import { DRAWER_SCOPE } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogTriggerProps = $props();
</script>

<ArkDialog.Trigger bind:ref {...rest} {...DRAWER_SCOPE} />
