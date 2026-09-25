<script lang="ts">
  import { Button, Dialog, Portal } from "@moderno-ui/svelte";
</script>

<Dialog.Root role="alertdialog">
  <Dialog.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="destructive" {...triggerProps()}>Delete project</Button>
    {/snippet}
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Title>Delete project</Dialog.Title>
        <Dialog.Description>
          This permanently removes the project and everything in it. This cannot be undone.
        </Dialog.Description>
        <div class="demo-row">
          <Dialog.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button variant="outline" {...closeProps()}>Cancel</Button>
            {/snippet}
          </Dialog.CloseTrigger>
          <Dialog.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button variant="destructive" {...closeProps()}>Delete</Button>
            {/snippet}
          </Dialog.CloseTrigger>
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
