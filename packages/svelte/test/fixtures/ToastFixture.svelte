<script lang="ts">
  import { Toast, Toaster } from "../../src/index.js";
  import type { CreateToasterReturn, ToastSize } from "../../src/index.js";

  let {
    toaster,
    size = undefined,
  }: {
    toaster: CreateToasterReturn;
    size?: ToastSize;
  } = $props();
</script>

<Toaster {toaster}>
  {#snippet children(toast)}
    <Toast.Root {size} class="note" data-testid="toast">
      <Toast.Title>{toast().title}</Toast.Title>
      <Toast.Description>{toast().description}</Toast.Description>
      {#if toast().action}
        <Toast.ActionTrigger>{toast().action?.label}</Toast.ActionTrigger>
      {/if}
      <Toast.CloseTrigger aria-label="Dismiss">×</Toast.CloseTrigger>
    </Toast.Root>
  {/snippet}
</Toaster>
