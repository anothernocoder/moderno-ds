<script lang="ts">
  import { Dialog, Portal } from "../../src/index.js";
</script>

<Dialog.Root>
  <Dialog.Trigger>Open dialog</Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Title>Delete account</Dialog.Title>
        <Dialog.Description>This action cannot be undone.</Dialog.Description>
        <Dialog.CloseTrigger>Cancel</Dialog.CloseTrigger>
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
