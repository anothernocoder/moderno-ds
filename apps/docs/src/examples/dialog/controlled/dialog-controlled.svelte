<script lang="ts">
  import { Button, Dialog, Portal } from "@moderno-ui/svelte";

  let open = $state(false);
</script>

<Button variant="outline" onclick={() => (open = true)}>Show shortcuts</Button>
<Dialog.Root bind:open>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Title>Keyboard shortcuts</Dialog.Title>
        <Dialog.Description>
          Press ⌘K to search and Esc to close any dialog.
        </Dialog.Description>
        <div class="demo-row">
          <Button onclick={() => (open = false)}>Got it</Button>
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
