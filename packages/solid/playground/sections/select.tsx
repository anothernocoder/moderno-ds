/**
 * Select — a collection + popover whose hidden native <select> and ids must
 * reach the server. Solid's <Portal> is client-only, so `open` leaves the
 * listbox out of the server string but still serialises the open state onto
 * the trigger.
 */
import { For } from "solid-js";
import { Portal } from "../../src/dialog.js";
import { Select, createListCollection } from "../../src/select.jsx";
import type { Section } from "../section.js";

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

const SelectSection: Section = (props) => (
  <section aria-label="select">
    <Select.Root collection={frameworks} size="md" defaultOpen={props.open}>
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
  </section>
);

export default SelectSection;
