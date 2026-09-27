<script setup lang="ts">
import { ref } from "vue";
import { Button, Popover, Portal } from "@moderno-ui/vue";

const open = ref(false);
</script>

<template>
  <Popover.Root v-model:open="open">
    <Popover.Trigger as-child>
      <Button variant="outline">Notifications</Button>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Title>You are all caught up</Popover.Title>
          <Popover.Description>New notifications show up here.</Popover.Description>
          <div class="demo-row">
            <Button size="sm" @click="open = false">Got it</Button>
          </div>
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
</template>
