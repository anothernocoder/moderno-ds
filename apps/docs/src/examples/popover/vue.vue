<script setup lang="ts">
import { Button, Popover, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Popover.Root>
    <Popover.Trigger as-child>
      <Button>Share</Button>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Title>Share this page</Popover.Title>
          <Popover.Description>Anyone with the link can view it.</Popover.Description>
          <Popover.CloseTrigger aria-label="Close">×</Popover.CloseTrigger>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
</template>
