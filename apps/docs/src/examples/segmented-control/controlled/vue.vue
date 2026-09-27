<script setup lang="ts">
import { ref } from "vue";
import { SegmentedControl } from "@moderno-ui/vue";

const scale = ref("fill");
</script>

<template>
  <SegmentedControl.Root v-model="scale" aria-label="Image scale">
    <SegmentedControl.Indicator />
    <SegmentedControl.Item value="fit">
      <SegmentedControl.ItemText>Fit</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="fill">
      <SegmentedControl.ItemText>Fill</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
    <SegmentedControl.Item value="stretch">
      <SegmentedControl.ItemText>Stretch</SegmentedControl.ItemText>
      <SegmentedControl.ItemHiddenInput />
    </SegmentedControl.Item>
  </SegmentedControl.Root>
  <p>Scale: {{ scale }}</p>
</template>
