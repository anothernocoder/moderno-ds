/** @jsxImportSource solid-js */
/**
 * Select across its three sizes — @moderno-ui/solid, the same demo every
 * framework's example shows. The menu is portalled and opens on click; it is
 * deliberately not forced open here.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { For } from "solid-js";
import { Select, Portal, createListCollection } from "@moderno-ui/solid";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

const sizes = [
  { size: "sm" as const, label: "Small", value: [] as string[] },
  { size: "md" as const, label: "Medium", value: ["svelte"] },
  { size: "lg" as const, label: "Large", value: [] as string[] },
];

export function SelectDemo() {
  return (
    <div class="demo-selects">
      <For each={sizes}>
        {(demo) => (
          <Select.Root collection={frameworks} size={demo.size} defaultValue={demo.value}>
            <Select.Label>{demo.label}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Pick one" />
                <Select.Indicator>▾</Select.Indicator>
              </Select.Trigger>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  <For each={frameworks.items}>
                    {(item) => (
                      <Select.Item item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    )}
                  </For>
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )}
      </For>
    </div>
  );
}
