/**
 * SSR playground — the reusable harness that validates Moderno's second
 * guarantee: server-render + hydrate with zero React warnings.
 *
 * It mounts the reference primitives in their default (closed) state. Each one
 * is deliberately exercised for an SSR hazard:
 *   - Button   — the trivial baseline (no ids, no portal).
 *   - Field    — `useId`-generated label/control ids must match across render,
 *                mounted at two sizes and over both controls (input + textarea)
 *                so the recipe's `data-size` is proven to survive SSR too.
 *   - Card     — a compound, CSS-only surface: every part must serialise its
 *                own `data-part` and the root its recipe attributes.
 *   - Field    — `useId`-generated label/control ids must match across render.
 *   - Checkbox — a label bound to a visually hidden native input by `useId`,
 *                plus indicators the machine hides via the `hidden` attribute.
 *   - Dialog   — a Portal + focus-trap machine that must emit a stable,
 *                hydration-safe trigger while its content stays unmounted-visible.
 *   - Select   — a collection + popover whose hidden native <select> and ids
 *                must serialise identically on server and client.
 *
 * The same tree is `renderToString`-ed on the server and `hydrateRoot`-ed on the
 * client. `open` mounts the Dialog and Select popovers so the SSR test can
 * exercise the harder hazard the spec calls out — portal content + `useId`-based
 * `aria-controls`/`aria-activedescendant` wiring must still hydrate clean.
 * Phases 3–4 reuse this shape for the other frameworks.
 */
import { Alert } from "../src/alert.js";
import { Button } from "../src/button.js";
import { Card } from "../src/card.js";
import { Field } from "../src/field.js";
import { Checkbox } from "../src/checkbox.js";
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

export interface AppProps {
  /** Mount the Dialog + Select popovers open (exercises the portal/id path). */
  open?: boolean;
}

export function App({ open = false }: AppProps) {
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

      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Input placeholder="you@example.com" />
        <Field.HelperText>We never share it.</Field.HelperText>
        <Field.ErrorText>Email is required.</Field.ErrorText>
      </Field.Root>

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

      <Dialog.Root defaultOpen={open}>
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

      <section aria-label="charts">
        <LineChart width={320} height={180} series={sales} />
        <AreaChart width={320} height={180} series={sales} />
        <BarChart width={320} height={180} categories={quarters} series={revenue} />
        <ScatterChart width={320} height={180} series={sales} />
      </section>
    </main>
  );
}
