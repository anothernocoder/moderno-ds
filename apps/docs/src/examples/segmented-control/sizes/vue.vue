<script setup lang="ts">
import { SegmentedControl } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <SegmentedControl.Root size="sm" default-value="week" aria-label="Small period">
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="day">
        <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="week">
        <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="month">
        <SegmentedControl.ItemText>Month</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
    <SegmentedControl.Root size="md" default-value="week" aria-label="Medium period">
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="day">
        <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="week">
        <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="month">
        <SegmentedControl.ItemText>Month</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
    <SegmentedControl.Root size="lg" default-value="week" aria-label="Large period">
      <SegmentedControl.Indicator />
      <SegmentedControl.Item value="day">
        <SegmentedControl.ItemText>Day</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="week">
        <SegmentedControl.ItemText>Week</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="month">
        <SegmentedControl.ItemText>Month</SegmentedControl.ItemText>
        <SegmentedControl.ItemHiddenInput />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  </div>
</template>
