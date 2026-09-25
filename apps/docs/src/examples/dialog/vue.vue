<!--
  A Dialog opened from its trigger: Ark portals the content, traps focus, locks
  scroll and restores focus to the trigger on close. Triggers render through
  `as-child`, so each button is the design system's own Button — @moderno-
  ui/vue.
-->
<script setup lang="ts">
import { Button, Dialog, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Dialog.Root>
    <Dialog.Trigger as-child>
      <Button>Publish changes</Button>
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
            <Dialog.CloseTrigger as-child>
              <Button variant="outline">Cancel</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger as-child>
              <Button>Publish</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
</template>
