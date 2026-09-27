<script lang="ts">
  import { Button, Toast, Toaster, createToaster } from "@moderno-ui/svelte";

  const toaster = createToaster({ placement: "bottom-end" });

  function save() {
    toaster.create({ title: "Changes saved", description: "Your profile is up to date." });
  }
</script>

<Button onclick={save}>Save changes</Button>
<Toaster {toaster}>
  {#snippet children(toast)}
    <Toast.Root>
      <Toast.Title>{toast().title}</Toast.Title>
      <Toast.Description>{toast().description}</Toast.Description>
      <Toast.CloseTrigger>×</Toast.CloseTrigger>
    </Toast.Root>
  {/snippet}
</Toaster>
