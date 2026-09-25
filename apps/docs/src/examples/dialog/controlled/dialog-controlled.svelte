<!--
  A controlled Dialog: the open state is yours, bound with `bind:open`, so any
  code can open or close it — here a plain Button outside the dialog, and one
  inside that closes it — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
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
