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
import { Callout } from "../src/callout.jsx";
import { Button } from "../src/button.jsx";
import { Divider } from "../src/divider.jsx";
import { Badge } from "../src/badge.jsx";
import { Chip } from "../src/chip.jsx";
import { Indicator } from "../src/indicator.jsx";
import { Skeleton } from "../src/skeleton.jsx";
import { Spinner } from "../src/spinner.jsx";
import { Field } from "../src/field.jsx";
import { Card } from "../src/card.jsx";
import { Avatar } from "../src/avatar.jsx";
import { Checkbox } from "../src/checkbox.jsx";
import { Switch } from "../src/switch.jsx";
import { RadioGroup } from "../src/radio-group.jsx";
import { Toggle } from "../src/toggle.jsx";
import { ToggleGroup } from "../src/toggle-group.jsx";
import { Tabs } from "../src/tabs.jsx";
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

      <section aria-label="badges">
        <Badge>Draft</Badge>
        <Badge variant="success" dot>
          Paid
        </Badge>
        <Badge variant="error" size="sm">
          Overdue
        </Badge>
      </section>

      <section aria-label="chips">
        <Chip>Design</Chip>
        <Chip variant="muted" size="sm" removable removeLabel="Remove React">
          React
        </Chip>
      </section>

      <section aria-label="indicators">
        <Indicator variant="success" pulse>
          Online
        </Indicator>
        <Indicator variant="error" size="sm" aria-label="Offline" />
      </section>

      <section aria-label="loading">
        <Skeleton />
        <Skeleton shape="rect" />
        <Skeleton shape="circle" />
        <Spinner />
        <Spinner size="lg" label="Saving changes" />
      </section>

      <section aria-label="avatars">
        <Avatar.Root>
          <Avatar.Fallback>AL</Avatar.Fallback>
          <Avatar.Image src="/ada.png" alt="Ada Lovelace" />
        </Avatar.Root>
        <Avatar.Root size="sm" shape="square">
          <Avatar.Fallback>MD</Avatar.Fallback>
        </Avatar.Root>
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

      <section aria-label="callouts">
        <Callout.Root>
          <Callout.Icon>i</Callout.Icon>
          <Callout.Content>
            <Callout.Title>Good to know</Callout.Title>
            <Callout.Description>Exports run overnight.</Callout.Description>
          </Callout.Content>
        </Callout.Root>
        <Callout.Root variant="warning">
          <Callout.Content>
            <Callout.Description>Renaming a workspace breaks old links.</Callout.Description>
          </Callout.Content>
        </Callout.Root>
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

      <section aria-label="switches">
        <Switch.Root defaultChecked>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>Airplane mode</Switch.Label>
          <Switch.HiddenInput />
        </Switch.Root>
        <Switch.Root size="sm" disabled>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>Bluetooth</Switch.Label>
          <Switch.HiddenInput />
        </Switch.Root>
      </section>

      <section aria-label="radio groups">
        <RadioGroup.Root defaultValue="standard">
          <RadioGroup.Label>Shipping</RadioGroup.Label>
          <RadioGroup.Item value="standard">
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>
              Standard
              <RadioGroup.ItemDescription>3–5 business days</RadioGroup.ItemDescription>
            </RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
          <RadioGroup.Item value="express">
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>
              Express
              <RadioGroup.ItemDescription>1–2 business days</RadioGroup.ItemDescription>
            </RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        </RadioGroup.Root>
        <RadioGroup.Root size="sm" orientation="horizontal" disabled>
          <RadioGroup.Label>Billing</RadioGroup.Label>
          <RadioGroup.Item value="monthly">
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>Monthly</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
          <RadioGroup.Item value="yearly">
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>Yearly</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </section>

      <section aria-label="toggles">
        <Toggle.Root defaultPressed>
          <Toggle.Indicator fallback="☆">★</Toggle.Indicator>
          Favorite
        </Toggle.Root>
        <Toggle.Root variant="outline" size="sm" disabled>
          <Toggle.Indicator fallback="☆">★</Toggle.Indicator>
          Pin
        </Toggle.Root>
        <ToggleGroup.Root defaultValue={["center"]} aria-label="Text alignment">
          <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
          <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
        </ToggleGroup.Root>
        <ToggleGroup.Root
          variant="outline"
          size="lg"
          orientation="vertical"
          multiple
          disabled
          aria-label="Text style"
        >
          <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
          <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
        </ToggleGroup.Root>
      </section>

      <section aria-label="tabs">
        <Tabs.Root defaultValue="account">
          <Tabs.List aria-label="Settings">
            <Tabs.Trigger value="account">Account</Tabs.Trigger>
            <Tabs.Trigger value="password">Password</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="account">Account panel</Tabs.Content>
          <Tabs.Content value="password">Password panel</Tabs.Content>
        </Tabs.Root>
        <Tabs.Root variant="enclosed" size="sm" orientation="vertical" defaultValue="team">
          <Tabs.List aria-label="Workspace">
            <Tabs.Trigger value="billing" disabled>
              Billing
            </Tabs.Trigger>
            <Tabs.Trigger value="team">Team</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="billing">Billing panel</Tabs.Content>
          <Tabs.Content value="team">Team panel</Tabs.Content>
        </Tabs.Root>
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
