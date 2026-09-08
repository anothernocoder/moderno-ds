<!--
  Select across its three sizes — @moderno-ui/vue, the same demo every
  framework's example shows. The menu is portalled and opens on click; it is
  deliberately not forced open here.
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

const sizes = [
  { size: "sm", label: "Small", value: [] as string[] },
  { size: "md", label: "Medium", value: ["svelte"] },
  { size: "lg", label: "Large", value: [] as string[] },
] as const;
</script>

<template>
  <div class="demo-selects">
    <Select.Root
      v-for="demo in sizes"
      :key="demo.size"
      :collection="frameworks"
      :size="demo.size"
      :default-value="[...demo.value]"
    >
      <Select.Label>{{ demo.label }}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Pick one" />
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
  </div>
</template>
