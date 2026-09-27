<script setup lang="ts">
import { ref } from "vue";
import { Button, Drawer, Portal } from "@moderno-ui/vue";

const open = ref(false);
</script>

<template>
  <Drawer.Root v-model:open="open">
    <Drawer.Trigger as-child>
      <Button variant="outline">Settings</Button>
    </Drawer.Trigger>
    <Portal>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Title>Settings</Drawer.Title>
          <Drawer.Description>Changes apply when you save.</Drawer.Description>
          <div class="demo-row">
            <Button @click="open = false">Save</Button>
          </div>
        </Drawer.Content>
      </Drawer.Positioner>
    </Portal>
  </Drawer.Root>
</template>
