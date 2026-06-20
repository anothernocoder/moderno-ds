/**
 * SSR playground — the Vue twin of the React harness. Mounts all four
 * primitives in their default (closed) state so the SSR suite can assert a
 * stable server string and a warning-free hydration. `open` mounts the Dialog +
 * Select popovers to exercise the harder portal/id path.
 */
import { defineComponent, h, type Component } from "vue";
import { Button } from "../src/button.js";
import { Field } from "../src/field.js";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.js";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.js";

// A shared sample dataset for the four chart examples (Phase 4 deliverable).
const sales = [
  {
    name: "2023",
    points: [
      { x: 0, y: 10 },
      { x: 1, y: 40 },
      { x: 2, y: 30 },
      { x: 3, y: 55 },
      { x: 4, y: 48 },
    ],
  },
  {
    name: "2024",
    points: [
      { x: 0, y: 5 },
      { x: 1, y: 18 },
      { x: 2, y: 25 },
      { x: 3, y: 22 },
      { x: 4, y: 35 },
    ],
  },
];
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const revenue = [{ name: "revenue", values: [12, 28, 19, 34] }];

const frameworks = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
});

export const App = defineComponent({
  name: "VueSsrApp",
  props: {
    open: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h("main", {}, [
        h("section", { "aria-label": "buttons" }, [
          h(Button, { variant: "primary" }, () => "Primary"),
          h(Button, { variant: "secondary" }, () => "Secondary"),
          h(Button, { variant: "outline" }, () => "Outline"),
          h(Button, { variant: "ghost", size: "sm" }, () => "Ghost"),
          h(Button, { variant: "destructive", size: "lg" }, () => "Destructive"),
        ]),

        h(Field.Root, {}, () => [
          h(Field.Label, {}, () => "Email"),
          h(Field.Input, { placeholder: "you@example.com" }),
          h(Field.HelperText, {}, () => "We never share it."),
          h(Field.ErrorText, {}, () => "Email is required."),
        ]),

        h(Dialog.Root, { defaultOpen: props.open }, () => [
          h(Dialog.Trigger, {}, () => "Open dialog"),
          h(Portal, {}, () => [
            h(Dialog.Backdrop),
            h(Dialog.Positioner, {}, () =>
              h(Dialog.Content, {}, () => [
                h(Dialog.Title, {}, () => "Delete account"),
                h(Dialog.Description, {}, () => "This action cannot be undone."),
                h(Dialog.CloseTrigger, {}, () => "Cancel"),
              ]),
            ),
          ]),
        ]),

        h(
          Select.Root as unknown as Component,
          { collection: frameworks, size: "md", defaultOpen: props.open },
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

        h("section", { "aria-label": "charts" }, [
          h(LineChart, { width: 320, height: 180, series: sales }),
          h(AreaChart, { width: 320, height: 180, series: sales }),
          h(BarChart, { width: 320, height: 180, categories: quarters, series: revenue }),
          h(ScatterChart, { width: 320, height: 180, series: sales }),
        ]),
      ]);
  },
});
