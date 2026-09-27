<script lang="ts">
  import { Button, Toast, Toaster, createToaster, type ToastSize } from "@moderno-ui/svelte";

  const toaster = createToaster({ placement: "bottom-start" });
  const sizes: ToastSize[] = ["sm", "md", "lg"];
</script>

<div class="demo-row">
  {#each sizes as size (size)}
    <Button
      variant="outline"
      onclick={() =>
        toaster.create({ title: `Size ${size}`, description: "Draft saved.", meta: { size } })}
    >
      {size}
    </Button>
  {/each}
  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root size={toast().meta?.size}>
        <Toast.Title>{toast().title}</Toast.Title>
        <Toast.Description>{toast().description}</Toast.Description>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>
