<script setup lang="ts">
import { Button, Portal, Tooltip } from "@moderno-ui/vue";
</script>

<template>
  <Tooltip.Root :open-delay="0" :close-delay="0">
    <Tooltip.Trigger as-child>
      <Button variant="outline">Copy</Button>
    </Tooltip.Trigger>
    <Portal>
      <Tooltip.Positioner>
        <Tooltip.Content>
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          Shows at once
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Portal>
  </Tooltip.Root>
</template>
