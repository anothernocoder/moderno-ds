<script lang="ts">
  import { Button, Toast, Toaster, createToaster } from "@moderno-ui/svelte";

  const toaster = createToaster({ placement: "bottom" });

  function archive() {
    toaster.create({
      title: "Message archived",
      action: { label: "Undo", onClick: () => toaster.create({ title: "Message restored" }) },
    });
  }
</script>

<Button variant="outline" onclick={archive}>Archive</Button>
<Toaster {toaster}>
  {#snippet children(toast)}
    <Toast.Root>
      <Toast.Title>{toast().title}</Toast.Title>
      {#if toast().action}
        <Toast.ActionTrigger>{toast().action?.label}</Toast.ActionTrigger>
      {/if}
    </Toast.Root>
  {/snippet}
</Toaster>
