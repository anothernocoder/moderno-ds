<script setup lang="ts">
import { Button, Popover, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Popover.Root :positioning="{ placement: 'right' }">
    <Popover.Trigger as-child>
      <Button variant="outline">Billing date</Button>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Description>You are billed on the 1st of each month.</Popover.Description>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
</template>
