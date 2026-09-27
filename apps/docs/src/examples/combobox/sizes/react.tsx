import { Combobox, Portal, createListCollection } from "@moderno-ui/react";

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

export function ComboboxSizesDemo() {
  return (
    <div className="demo-stack">
      {sizes.map(({ size, label }) => (
        <Combobox.Root key={size} collection={frameworks} size={size}>
          <Combobox.Label>{label}</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input placeholder="Search frameworks" />
            <Combobox.Trigger>▾</Combobox.Trigger>
          </Combobox.Control>
          <Portal>
            <Combobox.Positioner>
              <Combobox.Content>
                {frameworks.items.map((item) => (
                  <Combobox.Item key={item.value} item={item}>
                    <Combobox.ItemText>{item.label}</Combobox.ItemText>
                    <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
                  </Combobox.Item>
                ))}
              </Combobox.Content>
            </Combobox.Positioner>
          </Portal>
        </Combobox.Root>
      ))}
    </div>
  );
}
