<!--
  Drawer.Description — Ark's Dialog.Description (wired to the content's aria-describedby) under the "drawer" scope.
  Every prop passes straight through via `...rest`, and `bind:ref` reaches
  Ark's own bindable.
-->
<script lang="ts">
  import { Dialog as ArkDialog } from "@ark-ui/svelte";
  import type { DialogDescriptionProps } from "@ark-ui/svelte";
  import { DRAWER_SCOPE } from "./drawer-placement.js";

  let { ref = $bindable(null), ...rest }: DialogDescriptionProps = $props();
</script>

<ArkDialog.Description bind:ref {...rest} {...DRAWER_SCOPE} />
