<script lang="ts">
  import { Select, Portal, createListCollection } from "@moderno-ui/svelte";

  const frameworks = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid" },
    ],
  });
</script>

<Select.Root collection={frameworks} multiple defaultValue={["react", "vue"]}>
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
        {#each frameworks.items as item (item.value)}
          <Select.Item {item}>
            <Select.ItemText>{item.label}</Select.ItemText>
            <Select.ItemIndicator>✓</Select.ItemIndicator>
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Positioner>
  </Portal>
</Select.Root>
