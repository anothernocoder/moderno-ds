<!--
  Toast.Root with the Moderno `size` recipe folded in. Ark's Root spreads
  unknown props onto its data-part="root" element, so the recipe's attribute
  rides along and components.css styles the toast from it. `children` and
  every other prop pass straight through via `...rest`, and `bind:ref`
  reaches Ark's own bindable.
-->
<script lang="ts">
  import { Toast as ArkToast } from "@ark-ui/svelte";
  import type { ToastRootProps } from "@ark-ui/svelte";
  import { toastRecipe, type ToastSize } from "@moderno-ui/core";

  let {
    size,
    ref = $bindable(null),
    ...rest
  }: ToastRootProps & { size?: ToastSize } = $props();
</script>

<ArkToast.Root bind:ref {...rest} {...toastRecipe({ size })} />
