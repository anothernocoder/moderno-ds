<!--
  Drawer.Title — Ark's Dialog.Title (the drawer's accessible name) under the "drawer" scope.
  Every prop passes straight through via `...rest`, and `bind:ref` reaches
  Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogTitleProps } from "@ark-ui/svelte";
  import { DRAWER_SCOPE } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogTitleProps = $props();
</script>

<ArkDialog.Title bind:ref {...rest} {...DRAWER_SCOPE} />
