/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Combobox, Portal, createListCollection } from "@moderno-ui/solid";

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
    <div class="demo-stack">
      <For each={sizes}>
        {({ size, label }) => (
          <Combobox.Root collection={frameworks} size={size}>
            <Combobox.Label>{label}</Combobox.Label>
            <Combobox.Control>
              <Combobox.Input placeholder="Search frameworks" />
              <Combobox.Trigger>▾</Combobox.Trigger>
            </Combobox.Control>
            <Portal>
              <Combobox.Positioner>
                <Combobox.Content>
                  <For each={frameworks.items}>
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
        )}
      </For>
    </div>
  );
}
