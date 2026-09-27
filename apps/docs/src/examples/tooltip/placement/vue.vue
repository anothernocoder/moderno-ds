<script setup lang="ts">
import { Button, Portal, Tooltip } from "@moderno-ui/vue";

const placements = ["top", "right", "bottom", "left"] as const;
</script>

<template>
  <div class="demo-row">
    <Tooltip.Root v-for="placement in placements" :key="placement" :positioning="{ placement }">
      <Tooltip.Trigger as-child>
        <Button variant="outline">{{ placement }}</Button>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content>
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            On the {{ placement }}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  </div>
</template>
