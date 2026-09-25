<!--
  A Dialog holding a short form. With no role override Ark focuses the first
  focusable element in the content on open — here the input — @moderno-
  ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Button, Dialog, Field, Portal } from "@moderno-ui/svelte";
</script>

<Dialog.Root>
  <Dialog.Trigger>
    {#snippet asChild(triggerProps)}
      <Button variant="outline" {...triggerProps()}>Rename project</Button>
    {/snippet}
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Title>Rename project</Dialog.Title>
        <Dialog.Description>
          The new name shows in the sidebar and in every link to the project.
        </Dialog.Description>
        <Field.Root>
          <Field.Label>Project name</Field.Label>
          <Field.Input value="Moderno" />
        </Field.Root>
        <div class="demo-row">
          <Dialog.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button variant="outline" {...closeProps()}>Cancel</Button>
            {/snippet}
          </Dialog.CloseTrigger>
          <Dialog.CloseTrigger>
            {#snippet asChild(closeProps)}
              <Button {...closeProps()}>Save</Button>
            {/snippet}
          </Dialog.CloseTrigger>
        </div>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
