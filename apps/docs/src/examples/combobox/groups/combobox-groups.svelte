<script lang="ts">
  import { Combobox, Portal, useFilter, useListCollection } from "@moderno-ui/svelte";

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
    filter: (text, query) => filters().contains(text, query),
    groupBy: (item) => item.type,
  });
</script>

<Combobox.Root
  collection={collection()}
  onInputValueChange={(details) => filter(details.inputValue)}
>
  <Combobox.Label>Tool</Combobox.Label>
  <Combobox.Control>
    <Combobox.Input placeholder="Search tools" />
    <Combobox.Trigger>▾</Combobox.Trigger>
  </Combobox.Control>
  <Portal>
    <Combobox.Positioner>
      <Combobox.Content>
        <Combobox.Empty>No tools found</Combobox.Empty>
        {#each collection().group() as [type, items] (type)}
          <Combobox.ItemGroup>
            <Combobox.ItemGroupLabel>{type}</Combobox.ItemGroupLabel>
            {#each items as item (item.value)}
              <Combobox.Item {item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
              </Combobox.Item>
            {/each}
          </Combobox.ItemGroup>
        {/each}
      </Combobox.Content>
    </Combobox.Positioner>
  </Portal>
</Combobox.Root>
