<script setup lang="ts">
import { Button, Dialog, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Dialog.Root role="alertdialog">
    <Dialog.Trigger as-child>
      <Button variant="destructive">Delete project</Button>
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
            <Dialog.CloseTrigger as-child>
              <Button variant="outline">Cancel</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger as-child>
              <Button variant="destructive">Delete</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
</template>
