<script setup lang="ts">
import { ref } from "vue";
import { Button, Dialog, Portal } from "@moderno-ui/vue";

const open = ref(false);
</script>

<template>
  <Button variant="outline" @click="open = true">Show shortcuts</Button>
  <Dialog.Root v-model:open="open">
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Title>Keyboard shortcuts</Dialog.Title>
          <Dialog.Description>Press ⌘K to search and Esc to close any dialog.</Dialog.Description>
          <div class="demo-row">
            <Button @click="open = false">Got it</Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
</template>
