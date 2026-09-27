<script setup lang="ts">
import { Button, Popover, Portal, type PopoverSize } from "@moderno-ui/vue";

const sizes: { size: PopoverSize; label: string }[] = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
];
</script>

<template>
  <div class="demo-row">
    <Popover.Root v-for="{ size, label } in sizes" :key="size" :size="size">
      <Popover.Trigger as-child>
        <Button variant="outline">{{ label }}</Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Title>{{ label }} popover</Popover.Title>
            <Popover.Description>Padding and type follow the size.</Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  </div>
</template>
