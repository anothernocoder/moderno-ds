/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Combobox, Portal, useFilter, useListCollection } from "@moderno-ui/solid";

const tools = [
  { label: "React", value: "react", type: "Libraries" },
  { label: "Vue", value: "vue", type: "Libraries" },
  { label: "Svelte", value: "svelte", type: "Libraries" },
  { label: "Next.js", value: "next", type: "Meta-frameworks" },
  { label: "Nuxt", value: "nuxt", type: "Meta-frameworks" },
  { label: "SvelteKit", value: "sveltekit", type: "Meta-frameworks" },
];

export function ComboboxGroupsDemo() {
  const filters = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: tools,
    filter: (text, query) => filters().contains(text, query),
    groupBy: (item) => item.type,
  });

  return (
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
            <For each={collection().group()}>
              {([type, items]) => (
                <Combobox.ItemGroup>
                  <Combobox.ItemGroupLabel>{type}</Combobox.ItemGroupLabel>
                  <For each={items}>
                    {(item) => (
                      <Combobox.Item item={item}>
                        <Combobox.ItemText>{item.label}</Combobox.ItemText>
                        <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
                      </Combobox.Item>
                    )}
                  </For>
                </Combobox.ItemGroup>
              )}
            </For>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}
