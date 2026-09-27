<script setup lang="ts">
import { Button, Portal, Tooltip } from "@moderno-ui/vue";
</script>

<template>
  <Tooltip.Root>
    <Tooltip.Trigger as-child>
      <Button variant="outline">Save</Button>
    </Tooltip.Trigger>
    <Portal>
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          Save your changes
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Portal>
  </Tooltip.Root>
</template>
