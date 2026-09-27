import { Combobox, Portal, useFilter, useListCollection } from "@moderno-ui/react";

const frameworks = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
  { label: "Angular", value: "angular" },
  { label: "Preact", value: "preact" },
];

export function ComboboxMultipleDemo() {
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter } = useListCollection({ initialItems: frameworks, filter: contains });

  return (
    <Combobox.Root
      collection={collection}
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
      <Combobox.Context>{(combobox) => `Picked: ${combobox.valueAsString}`}</Combobox.Context>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No frameworks found</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item key={item.value} item={item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}
