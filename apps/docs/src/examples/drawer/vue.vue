<script setup lang="ts">
import { Button, Drawer, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Drawer.Root>
    <Drawer.Trigger as-child>
      <Button>Filters</Button>
    </Drawer.Trigger>
    <Portal>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow the list of orders.</Drawer.Description>
          <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
          <div class="demo-row">
            <Drawer.CloseTrigger as-child>
              <Button variant="outline">Cancel</Button>
            </Drawer.CloseTrigger>
            <Drawer.CloseTrigger as-child>
              <Button>Apply</Button>
            </Drawer.CloseTrigger>
          </div>
        </Drawer.Content>
      </Drawer.Positioner>
    </Portal>
  </Drawer.Root>
</template>
