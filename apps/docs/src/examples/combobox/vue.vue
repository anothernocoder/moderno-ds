<script setup lang="ts">
import {
  Combobox,
  Portal,
  useFilter,
  useListCollection,
  type ComboboxInputValueChangeDetails,
} from "@moderno-ui/vue";

const frameworks = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
  { label: "Angular", value: "angular" },
  { label: "Preact", value: "preact" },
];

const filters = useFilter({ sensitivity: "base" });
const { collection, filter } = useListCollection({
  initialItems: frameworks,
  filter: (text, query) => filters.value.contains(text, query),
});

const onInputValueChange = (details: ComboboxInputValueChangeDetails) => filter(details.inputValue);
</script>

<template>
  <Combobox.Root :collection="collection" @input-value-change="onInputValueChange">
    <Combobox.Label>Framework</Combobox.Label>
    <Combobox.Control>
      <Combobox.Input placeholder="Search frameworks" />
      <Combobox.Trigger>▾</Combobox.Trigger>
    </Combobox.Control>
    <Portal>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No frameworks found</Combobox.Empty>
          <Combobox.Item v-for="item in collection.items" :key="item.value" :item="item">
            <Combobox.ItemText>{{ item.label }}</Combobox.ItemText>
            <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
          </Combobox.Item>
        </Combobox.Content>
      </Combobox.Positioner>
    </Portal>
  </Combobox.Root>
</template>
