<script setup lang="ts">
import { Button, Drawer, Portal } from "@moderno-ui/vue";

const placements = [
  { placement: "left", label: "Left" },
  { placement: "right", label: "Right" },
  { placement: "top", label: "Top" },
  { placement: "bottom", label: "Bottom" },
] as const;
</script>

<template>
  <div class="demo-row">
    <Drawer.Root v-for="{ placement, label } in placements" :key="placement" :placement="placement">
      <Drawer.Trigger as-child>
        <Button variant="outline">{{ label }}</Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Title>{{ label }} drawer</Drawer.Title>
            <Drawer.Description>It slides in from the {{ placement }} edge.</Drawer.Description>
            <Drawer.CloseTrigger aria-label="Close">×</Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  </div>
</template>
