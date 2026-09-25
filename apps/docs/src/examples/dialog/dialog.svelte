<!--
  A Dialog opened from its trigger: Ark portals the content, traps focus, locks
  scroll and restores focus to the trigger on close. Triggers render through
  `asChild`, so each button is the design system's own Button — @moderno-
  ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Button, Dialog, Portal } from "@moderno-ui/svelte";
</script>

<Dialog.Root>
  <Dialog.Trigger>
    {#snippet asChild(triggerProps)}
      <Button {...triggerProps()}>Publish changes</Button>
    {/snippet}
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Title>Publish changes?</Dialog.Title>
        <Dialog.Description>
          Your edits go live for everyone with access to this site.
        </Dialog.Description>
        <div class="demo-row">
          <Dialog.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button variant="outline" {...closeProps()}>Cancel</Button>
            {/snippet}
          </Dialog.CloseTrigger>
          <Dialog.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button {...closeProps()}>Publish</Button>
            {/snippet}
          </Dialog.CloseTrigger>
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
