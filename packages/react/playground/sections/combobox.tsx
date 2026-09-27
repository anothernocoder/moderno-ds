/**
 * Combobox — Ark's combobox machine: the label pointing at the input, the
 * input's `aria-controls` / `aria-expanded` against the listbox, each item's
 * id and selected state, a multiple listbox and the empty state must match
 * both ways. The list is rendered in place (no Portal), so the closed
 * listbox reaches the server string and hydrates too; `open` mounts the
 * first one open.
 */
import { Combobox } from "../../src/combobox.js";
import { createListCollection } from "../../src/select.js";
import type { Section } from "../section.js";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});
const nothing = createListCollection<{ label: string; value: string }>({ items: [] });

/** One combobox: the input and its buttons, then the listbox in place. */
function Frameworks(props: {
  size: "sm" | "md" | "lg";
  collection: typeof frameworks;
  open?: boolean;
  multiple?: boolean;
  defaultValue?: string[];
}) {
  return (
    <Combobox.Root
      size={props.size}
      collection={props.collection}
      defaultOpen={props.open}
      multiple={props.multiple}
      defaultValue={props.defaultValue}
    >
      <Combobox.Label>Framework</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Search frameworks" />
        <Combobox.ClearTrigger>×</Combobox.ClearTrigger>
        <Combobox.Trigger>▾</Combobox.Trigger>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No frameworks found</Combobox.Empty>
          {props.collection.items.map((item) => (
            <Combobox.Item key={item.value} item={item}>
              <Combobox.ItemText>{item.label}</Combobox.ItemText>
              <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}

const ComboboxSection: Section = ({ open }) => (
  <section aria-label="combobox">
    <Frameworks size="md" collection={frameworks} open={open} />
    <Frameworks size="sm" collection={frameworks} multiple defaultValue={["vue", "solid"]} />
    <Frameworks size="lg" collection={nothing} />
  </section>
);

export default ComboboxSection;
