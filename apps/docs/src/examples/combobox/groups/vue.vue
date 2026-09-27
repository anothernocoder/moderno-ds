<script setup lang="ts">
import {
  Combobox,
  Portal,
  useFilter,
  useListCollection,
  type ComboboxInputValueChangeDetails,
} from "@moderno-ui/vue";

const tools = [
  { label: "React", value: "react", type: "Libraries" },
  { label: "Vue", value: "vue", type: "Libraries" },
  { label: "Svelte", value: "svelte", type: "Libraries" },
  { label: "Next.js", value: "next", type: "Meta-frameworks" },
  { label: "Nuxt", value: "nuxt", type: "Meta-frameworks" },
  { label: "SvelteKit", value: "sveltekit", type: "Meta-frameworks" },
];

const filters = useFilter({ sensitivity: "base" });
const { collection, filter } = useListCollection({
  initialItems: tools,
  filter: (text, query) => filters.value.contains(text, query),
  groupBy: (item) => item.type,
});

const onInputValueChange = (details: ComboboxInputValueChangeDetails) => filter(details.inputValue);
</script>

<template>
  <Combobox.Root :collection="collection" @input-value-change="onInputValueChange">
    <Combobox.Label>Tool</Combobox.Label>
    <Combobox.Control>
      <Combobox.Input placeholder="Search tools" />
      <Combobox.Trigger>▾</Combobox.Trigger>
    </Combobox.Control>
    <Portal>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No tools found</Combobox.Empty>
          <Combobox.ItemGroup v-for="[type, items] in collection.group()" :key="type">
            <Combobox.ItemGroupLabel>{{ type }}</Combobox.ItemGroupLabel>
            <Combobox.Item v-for="item in items" :key="item.value" :item="item">
              <Combobox.ItemText>{{ item.label }}</Combobox.ItemText>
              <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
            </Combobox.Item>
          </Combobox.ItemGroup>
        </Combobox.Content>
      </Combobox.Positioner>
    </Portal>
  </Combobox.Root>
</template>
