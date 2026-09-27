/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Combobox, Portal, useFilter, useListCollection } from "@moderno-ui/solid";

const frameworks = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
  { label: "Angular", value: "angular" },
  { label: "Preact", value: "preact" },
];

export function ComboboxDemo() {
  const filters = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({
    initialItems: frameworks,
    filter: (text, query) => filters().contains(text, query),
  });

  return (
    <Combobox.Root
      collection={collection()}
      onInputValueChange={(details) => filter(details.inputValue)}
    >
      <Combobox.Label>Framework</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Search frameworks" />
        <Combobox.Trigger>▾</Combobox.Trigger>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No frameworks found</Combobox.Empty>
            <For each={collection().items}>
              {(item) => (
                <Combobox.Item item={item}>
                  <Combobox.ItemText>{item.label}</Combobox.ItemText>
                  <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </For>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}
