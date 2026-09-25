<!--
  A multiple Select — the menu stays open between picks and the trigger
  lists every chosen label — @moderno-ui/vue.
-->
<script setup lang="ts">
import { Select, Portal, createListCollection } from "@moderno-ui/vue";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});
</script>

<template>
  <Select.Root :collection="frameworks" multiple :default-value="['react', 'vue']">
    <Select.Label>Frameworks</Select.Label>
    <Select.Control>
      <Select.Trigger>
        <Select.ValueText placeholder="Pick any" />
        <Select.Indicator>▾</Select.Indicator>
      </Select.Trigger>
    </Select.Control>
    <Portal>
      <Select.Positioner>
        <Select.Content>
          <Select.Item v-for="item in frameworks.items" :key="item.value" :item="item">
            <Select.ItemText>{{ item.label }}</Select.ItemText>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        </Select.Content>
      </Select.Positioner>
    </Portal>
  </Select.Root>
</template>
