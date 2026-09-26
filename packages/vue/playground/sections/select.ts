/**
 * Select — Ark's listbox machine behind a Portal: the trigger is on the
 * server while the popover is closed, and `open` mounts the teleported list.
 */
import { h, type Component } from "vue";
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

const SelectSection: Section = ({ open }) =>
  h("section", { "aria-label": "select" }, [
    h(
      Select.Root as unknown as Component,
      { collection: frameworks, size: "md", defaultOpen: open },
      () => [
        h(Select.Label, {}, () => "Framework"),
        h(Select.Control, {}, () =>
          h(Select.Trigger, {}, () => [
            h(Select.ValueText, { placeholder: "Pick one" }),
            h(Select.Indicator, {}, () => "▾"),
          ]),
        ),
        h(Portal, {}, () =>
          h(Select.Positioner, {}, () =>
            h(Select.Content, {}, () =>
              frameworks.items.map((item) =>
                h(Select.Item, { key: item.value, item }, () => [
                  h(Select.ItemText, {}, () => item.label),
                  h(Select.ItemIndicator, {}, () => "✓"),
                ]),
              ),
            ),
          ),
        ),
      ],
    ),
  ]);

export default SelectSection;
