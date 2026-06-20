<script lang="ts">
  import { Select, Portal, createListCollection } from "../../src/index.js";
  import type { SelectValueChangeDetails } from "../../src/index.js";

  let { onValueChange }: { onValueChange?: (d: SelectValueChangeDetails) => void } = $props();

  const collection = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
    ],
  });
</script>

<Select.Root {collection} size="sm" {onValueChange}>
  <Select.Label>Framework</Select.Label>
  <Select.Control>
    <Select.Trigger>
      <Select.ValueText placeholder="Pick one" />
      <Select.Indicator>▼</Select.Indicator>
    </Select.Trigger>
  </Select.Control>
  <Portal>
    <Select.Positioner>
      <Select.Content>
        {#each collection.items as item (item.value)}
          <Select.Item {item}>
            <Select.ItemText>{item.label}</Select.ItemText>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Positioner>
  </Portal>
</Select.Root>
