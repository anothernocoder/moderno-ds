/**
 * Combobox — Ark's combobox machine: the label pointing at the input, the
 * input's `aria-controls` / `aria-expanded` against the listbox, each item's
 * id and selected state, a multiple listbox and the empty state must match
 * both ways. The list is rendered in place (no Portal), so the closed
 * listbox reaches the server string and hydrates too; `open` mounts the
 * first one open.
 */
import { h } from "vue";
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

// One combobox: the input and its buttons, then the listbox in place.
const frameworksCombobox = (collection: typeof frameworks, rootProps: Record<string, unknown>) =>
  h(Combobox.Root, { collection, ...rootProps }, () => [
    h(Combobox.Label, {}, () => "Framework"),
    h(Combobox.Control, {}, () => [
      h(Combobox.Input, { placeholder: "Search frameworks" }),
      h(Combobox.ClearTrigger, {}, () => "×"),
      h(Combobox.Trigger, {}, () => "▾"),
    ]),
    h(Combobox.Positioner, {}, () =>
      h(Combobox.Content, {}, () => [
        h(Combobox.Empty, {}, () => "No frameworks found"),
        ...collection.items.map((item) =>
          h(Combobox.Item, { key: item.value, item }, () => [
            h(Combobox.ItemText, {}, () => item.label),
            h(Combobox.ItemIndicator, {}, () => "✓"),
          ]),
        ),
      ]),
    ),
  ]);

const ComboboxSection: Section = ({ open }) =>
  h("section", { "aria-label": "combobox" }, [
    frameworksCombobox(frameworks, { size: "md", defaultOpen: open }),
    frameworksCombobox(frameworks, {
      size: "sm",
      multiple: true,
      defaultValue: ["vue", "solid"],
    }),
    frameworksCombobox(nothing, { size: "lg" }),
  ]);

export default ComboboxSection;
