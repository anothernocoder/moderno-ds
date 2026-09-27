<script lang="ts">
  import { Button, Toast, Toaster, createToaster } from "@moderno-ui/svelte";

  const toaster = createToaster({ placement: "top" });
</script>

<Button variant="outline" onclick={() => toaster.create({ title: "Shown at the top" })}>
  Show at the top
</Button>
<Toaster {toaster}>
  {#snippet children(toast)}
    <Toast.Root>
      <Toast.Title>{toast().title}</Toast.Title>
    </Toast.Root>
  {/snippet}
</Toaster>
