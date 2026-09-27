<script setup lang="ts">
import { Combobox, Portal, createListCollection } from "@moderno-ui/vue";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});
const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;
</script>

<template>
  <div class="demo-stack">
    <Combobox.Root
      v-for="{ size, label } in sizes"
      :key="size"
      :collection="frameworks"
      :size="size"
    >
      <Combobox.Label>{{ label }}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Search frameworks" />
        <Combobox.Trigger>▾</Combobox.Trigger>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Item v-for="item in frameworks.items" :key="item.value" :item="item">
              <Combobox.ItemText>{{ item.label }}</Combobox.ItemText>
              <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
            </Combobox.Item>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  </div>
</template>
