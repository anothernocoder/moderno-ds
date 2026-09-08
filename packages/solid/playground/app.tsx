/**
 * SSR playground — the Solid twin of the React harness. Mounts every one of the
 * primitives in their default (closed) state; `open` mounts the Dialog + Select
 * popovers so the SSR smoke can exercise the portal/id path.
 * SSR playground — the Solid twin of the React harness. Mounts the primitives
 * in their default (closed) state; `open` mounts the Dialog + Select popovers
 * so the SSR smoke can exercise the portal/id path.
 */
import { For } from "solid-js";
import { Alert } from "../src/alert.jsx";
import { Button } from "../src/button.jsx";
import { Divider } from "../src/divider.jsx";
import { Field } from "../src/field.jsx";
import { Card } from "../src/card.jsx";
import { Checkbox } from "../src/checkbox.jsx";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.jsx";
import { PinInput } from "../src/pin-input.jsx";
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

// A six-digit one-time code: the cell indices the PinInput renders. `count` on
// the Root tells Ark the same number so the server-rendered aria labels match.
const CODE_CELLS = [0, 1, 2, 3, 4, 5];

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

      <section aria-label="dividers">
        <Divider />
        <Divider align="start">Or</Divider>
        <Divider orientation="vertical" />
        <Divider orientation="vertical">Or</Divider>
      </section>

      <section aria-label="alerts">
        <Alert.Root variant="info">
          <Alert.Icon>i</Alert.Icon>
          <Alert.Content>
            <Alert.Title>Heads up</Alert.Title>
            <Alert.Description>Your trial ends in three days.</Alert.Description>
            <Alert.Action>
              <Button size="sm" variant="outline">
                Manage plan
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
        <Alert.Root variant="error" size="sm">
          <Alert.Icon>!</Alert.Icon>
          <Alert.Content>
            <Alert.Title>Payment failed</Alert.Title>
            <Alert.Description>We could not charge your card.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </section>

      <section aria-label="fields">
        <Field.Root size="sm">
          <Field.Label>Email</Field.Label>
          <Field.Input placeholder="you@example.com" />
          <Field.HelperText>We never share it.</Field.HelperText>
          <Field.ErrorText>Email is required.</Field.ErrorText>
        </Field.Root>

        <Field.Root size="lg" invalid>
          <Field.Label>Bio</Field.Label>
          <Field.Textarea placeholder="Tell us about yourself" />
          <Field.HelperText>A short introduction.</Field.HelperText>
          <Field.ErrorText>Bio is required.</Field.ErrorText>
        </Field.Root>
      </section>
      <Card.Root variant="outline" size="md">
        <Card.Header>
          <Card.Title>Monthly report</Card.Title>
          <Card.Description>Revenue across every channel.</Card.Description>
        </Card.Header>
        <Card.Content>Up 12% on last month.</Card.Content>
        <Card.Footer>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </Card.Footer>
      </Card.Root>

      <section aria-label="checkboxes">
        <Checkbox.Root defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Email me updates</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root size="sm" defaultChecked="indeterminate">
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
            <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Select all</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root size="lg" disabled>
          <Checkbox.Control>
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>Unavailable</Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </section>

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

      <PinInput.Root count={CODE_CELLS.length} otp size="md">
        <PinInput.Label>Verification code</PinInput.Label>
        <PinInput.Control>
          <For each={CODE_CELLS}>{(index) => <PinInput.Input index={index} />}</For>
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>

      <section aria-label="charts">
        <LineChart width={320} height={180} series={sales} />
        <AreaChart width={320} height={180} series={sales} />
        <BarChart width={320} height={180} categories={quarters} series={revenue} />
        <ScatterChart width={320} height={180} series={sales} />
      </section>
    </main>
  );
}
