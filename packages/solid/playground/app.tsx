/**
 * SSR playground — the Solid twin of the React harness. Mounts all four
 * primitives in their default (closed) state; `open` mounts the Dialog + Select
 * popovers so the SSR smoke can exercise the portal/id path.
 */
import { For } from "solid-js";
import { Button } from "../src/button.jsx";
import { Field } from "../src/field.js";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.jsx";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/charts.jsx";

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

export function App(props: { open?: boolean }) {
  return (
    <main>
      <section aria-label="buttons">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost" size="sm">
          Ghost
        </Button>
        <Button variant="destructive" size="lg">
          Destructive
        </Button>
      </section>

      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="you@example.com" />
        <Field.HelperText>We never share it.</Field.HelperText>
        <Field.ErrorText>Email is required.</Field.ErrorText>
      </Field.Root>

      <Dialog.Root defaultOpen={props.open}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Title>Delete account</Dialog.Title>
              <Dialog.Description>This action cannot be undone.</Dialog.Description>
              <Dialog.CloseTrigger>Cancel</Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

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

      <section aria-label="charts">
        <LineChart width={320} height={180} series={sales} />
        <AreaChart width={320} height={180} series={sales} />
        <BarChart width={320} height={180} categories={quarters} series={revenue} />
        <ScatterChart width={320} height={180} series={sales} />
      </section>
    </main>
  );
}
