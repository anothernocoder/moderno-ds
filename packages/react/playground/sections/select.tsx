/**
 * Select — a collection + popover whose hidden native <select> and ids must
 * serialise identically on server and client. `open` mounts the popover, so
 * its `aria-activedescendant` wiring hydrates too.
 */
import { Portal } from "../../src/dialog.js";
import { Select, createListCollection } from "../../src/select.js";
import type { Section } from "../section.js";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

const SelectSection: Section = ({ open }) => (
  <section aria-label="select">
    <Select.Root collection={frameworks} size="md" defaultOpen={open}>
      <Select.Label>Framework</Select.Label>
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
  </section>
);

export default SelectSection;
