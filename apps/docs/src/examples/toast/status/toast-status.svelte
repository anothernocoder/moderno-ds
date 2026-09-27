<script lang="ts">
  import { Button, Toast, Toaster, createToaster } from "@moderno-ui/svelte";

  const toaster = createToaster({ placement: "top-end" });
</script>

<div class="demo-row">
  <Button variant="outline" onclick={() => toaster.success({ title: "Payment received" })}>
    Success
  </Button>
  <Button variant="outline" onclick={() => toaster.error({ title: "Upload failed" })}>
    Error
  </Button>
  <Button variant="outline" onclick={() => toaster.warning({ title: "Storage almost full" })}>
    Warning
  </Button>
  <Button variant="outline" onclick={() => toaster.info({ title: "New version available" })}>
    Info
  </Button>
  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root>
        <Toast.Title>{toast().title}</Toast.Title>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>
