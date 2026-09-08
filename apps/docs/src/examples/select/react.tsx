/**
 * Select across its three sizes — @moderno-ui/react, the same demo every
 * framework's example shows. The menu is portalled and opens on click; it is
 * deliberately not forced open here.
 */
import { Select, Portal, createListCollection } from "@moderno-ui/react";

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
    <div className="demo-selects">
      {sizes.map((demo) => (
        <Select.Root
          key={demo.size}
          collection={frameworks}
          size={demo.size}
          defaultValue={demo.value}
        >
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
                {frameworks.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      ))}
    </div>
  );
}
