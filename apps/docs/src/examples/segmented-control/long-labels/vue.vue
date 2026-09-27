<script setup lang="ts">
import { SegmentedControl } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <SegmentedControl.Root full-width default-value="fit" aria-label="Image scale">
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="fit">
        <SegmentedControl.ItemText>Fit inside the frame</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="fill">
        <SegmentedControl.ItemText>Fill the whole frame</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="stretch">
        <SegmentedControl.ItemText>Stretch to the edges</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  </div>
</template>
