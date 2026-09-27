<script lang="ts">
  import { Combobox, Portal, useFilter, useListCollection } from "@moderno-ui/svelte";

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
    filter: (text, query) => filters().contains(text, query),
  });
</script>

<Combobox.Root
  collection={collection()}
  onInputValueChange={(details) => filter(details.inputValue)}
  multiple
  defaultValue={["react", "vue"]}
>
  <Combobox.Label>Frameworks</Combobox.Label>
  <Combobox.Control>
    <Combobox.Input placeholder="Add a framework" />
    <Combobox.ClearTrigger>×</Combobox.ClearTrigger>
    <Combobox.Trigger>▾</Combobox.Trigger>
  </Combobox.Control>
  <Combobox.Context>
    {#snippet render(combobox)}
      Picked: {combobox().valueAsString}
    {/snippet}
  </Combobox.Context>
  <Portal>
    <Combobox.Positioner>
      <Combobox.Content>
        <Combobox.Empty>No frameworks found</Combobox.Empty>
        {#each collection().items as item (item.value)}
          <Combobox.Item {item}>
            <Combobox.ItemText>{item.label}</Combobox.ItemText>
            <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
          </Combobox.Item>
        {/each}
      </Combobox.Content>
    </Combobox.Positioner>
  </Portal>
</Combobox.Root>
