<script setup lang="ts">
import { Button, Portal, Tooltip } from "@moderno-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div class="demo-row">
    <Tooltip.Root v-for="size in sizes" :key="size" :size="size">
      <Tooltip.Trigger as-child>
        <Button variant="outline">{{ size }}</Button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            A {{ size }} tooltip
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  </div>
</template>
