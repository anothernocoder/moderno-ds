/**
 * SSR playground — the reusable harness that validates Moderno's second
 * guarantee: server-render + hydrate with zero React warnings.
 *
 * It mounts every one of the reference primitives in their default (closed)
 * state. Each one is deliberately exercised for an SSR hazard:
 *   - Button   — the trivial baseline (no ids, no portal).
 *   - Field    — `useId`-generated label/control ids must match across render,
 *                mounted at two sizes and over both controls (input + textarea)
 *                so the recipe's `data-size` is proven to survive SSR too.
 *   - Card     — a compound, CSS-only surface: every part must serialise its
 *                own `data-part` and the root its recipe attributes.
 *   - Divider  — CSS-only, but proves an optional child (the label) and the
 *                conditional separator role serialise identically both ways.
 *                Mounted in every recipe cell the props table advertises,
 *                captioned × vertical included.
 *   - Badge / Chip / Indicator — CSS-only; prove the optional parts (the
 *                badge dot, the chip's remove button, the indicator label) and
 *                the bare `data-pulse` attribute serialise identically both ways.
 *   - Callout  — CSS-only; the note role and the optional icon serialise
 *                identically both ways, at two statuses.
 *   - Skeleton / Spinner — CSS-only loading states; every shape, and the
 *                spinner's status role, ring and label, match both ways.
 *   - Avatar   — Ark's image-loading machine: ids from `useId`, and the
 *                fallback shown / image hidden while loading must match both ways.
 *   - Checkbox — a label bound to a visually hidden native input by `useId`,
 *                plus indicators the machine hides via the `hidden` attribute.
 *   - Switch   — the same label ↔ hidden-input pairing by `useId`, with the
 *                on/off state and the switch role on the server string.
 *   - RadioGroup — one native radio per item, each bound to its label and
 *                text by ids from `useId`; the checked item, the orientation
 *                and the disabled group must match both ways.
 *   - Toggle / ToggleGroup — Ark's toggle machines on native buttons; the
 *                pressed state (aria-pressed, aria-checked, data-state), the
 *                Indicator's on/off content, the group's role and orientation,
 *                and the disabled buttons must match both ways; item ids come
 *                from `useId`.
 *   - Tabs     — Ark's tabs machine: trigger, panel and list ids from `useId`
 *                wired by aria-controls / aria-labelledby, the selected tab
 *                (aria-selected, data-selected), the hidden panels, the
 *                orientation and a disabled tab must match both ways.
 *   - Accordion — Ark's accordion machine over collapsible items: trigger and
 *                content ids from `useId` wired by aria-controls /
 *                aria-labelledby, the open items (aria-expanded, data-state),
 *                the hidden contents and a disabled item must match both ways.
 *   - Progress — Ark's progress machine: the progressbar's value and ids, the
 *                range's inline width, the circle's inline geometry and the
 *                loading / indeterminate state must match both ways.
 *   - Slider   — Ark's slider machine: each thumb's slider role, value, bounds
 *                and ids, the root's inline range and thumb offsets, and the
 *                markers' state must match both ways.
 *   - NumberInput — Ark's number-input machine: the spinbutton's value,
 *                bounds, formatted text and ids, and a stepper disabled at
 *                its bound must match both ways.
 *   - Dialog   — a Portal + focus-trap machine that must emit a stable,
 *                hydration-safe trigger while its content stays unmounted-visible.
 *   - Select   — a collection + popover whose hidden native <select> and ids
 *                must serialise identically on server and client.
 *   - PinInput — n cells whose ids and aria labels are derived from the root id
 *                and `count`, so the server must know the cell count too.
 *
 * The same tree is `renderToString`-ed on the server and `hydrateRoot`-ed on the
 * client. `open` mounts the Dialog and Select popovers so the SSR test can
 * exercise the harder hazard the spec calls out — portal content + `useId`-based
 * `aria-controls`/`aria-activedescendant` wiring must still hydrate clean.
 * Phases 3–4 reuse this shape for the other frameworks.
 */
import { Alert } from "../src/alert.js";
import { Callout } from "../src/callout.js";
import { Button } from "../src/button.js";
import { Divider } from "../src/divider.js";
import { Badge } from "../src/badge.js";
import { Chip } from "../src/chip.js";
import { Indicator } from "../src/indicator.js";
import { Skeleton } from "../src/skeleton.js";
import { Spinner } from "../src/spinner.js";
import { Card } from "../src/card.js";
import { Field } from "../src/field.js";
import { Avatar } from "../src/avatar.js";
import { Checkbox } from "../src/checkbox.js";
import { Switch } from "../src/switch.js";
import { RadioGroup } from "../src/radio-group.js";
import { Toggle } from "../src/toggle.js";
import { ToggleGroup } from "../src/toggle-group.js";
import { Tabs } from "../src/tabs.js";
import { Accordion } from "../src/accordion.js";
import { Progress } from "../src/progress.js";
import { Slider } from "../src/slider.js";
import { NumberInput } from "../src/number-input.js";
import { Dialog, Portal } from "../src/dialog.js";
import { Select, createListCollection } from "../src/select.js";
import { PinInput } from "../src/pin-input.js";
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

      <section aria-label="accordion">
        <Accordion.Root defaultValue={["shipping"]}>
          <Accordion.Item value="shipping">
            <Accordion.ItemTrigger>
              Shipping
              <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>Shipping answer</Accordion.ItemContent>
          </Accordion.Item>
          <Accordion.Item value="returns">
            <Accordion.ItemTrigger>
              Returns
              <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>Returns answer</Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
        <Accordion.Root variant="enclosed" size="sm" multiple defaultValue={["support"]}>
          <Accordion.Item value="warranty" disabled>
            <Accordion.ItemTrigger>
              Warranty
              <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>Warranty answer</Accordion.ItemContent>
          </Accordion.Item>
          <Accordion.Item value="support">
            <Accordion.ItemTrigger>
              Support
              <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>Support answer</Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </section>

      <section aria-label="progress">
        <Progress.Root value={40}>
          <Progress.Label>Uploading</Progress.Label>
          <Progress.ValueText />
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
        <Progress.Root size="sm" value={75}>
          <Progress.Circle>
            <Progress.CircleTrack />
            <Progress.CircleRange />
          </Progress.Circle>
          <Progress.ValueText />
        </Progress.Root>
        <Progress.Root size="lg" value={null}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </section>

      <section aria-label="slider">
        <Slider.Root defaultValue={[40]}>
          <Slider.Label>Volume</Slider.Label>
          <Slider.ValueText />
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0}>
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
          <Slider.MarkerGroup>
            <Slider.Marker value={0}>0</Slider.Marker>
            <Slider.Marker value={50}>50</Slider.Marker>
            <Slider.Marker value={100}>100</Slider.Marker>
          </Slider.MarkerGroup>
        </Slider.Root>
        <Slider.Root size="sm" defaultValue={[20, 80]}>
          <Slider.Label>Price</Slider.Label>
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0}>
              <Slider.HiddenInput />
            </Slider.Thumb>
            <Slider.Thumb index={1}>
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
      </section>

      <section aria-label="number-input">
        <NumberInput.Root defaultValue="10" min={0} max={10}>
          <NumberInput.Label>Quantity</NumberInput.Label>
          <NumberInput.Control>
            <NumberInput.Input />
            <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
            <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
          </NumberInput.Control>
        </NumberInput.Root>
        <NumberInput.Root
          size="sm"
          defaultValue="1234.5"
          formatOptions={{ style: "currency", currency: "USD" }}
        >
          <NumberInput.Label>Price</NumberInput.Label>
          <NumberInput.Control>
            <NumberInput.Input />
            <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
            <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
          </NumberInput.Control>
        </NumberInput.Root>
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

      <PinInput.Root count={CODE_CELLS.length} otp size="md">
        <PinInput.Label>Verification code</PinInput.Label>
        <PinInput.Control>
          {CODE_CELLS.map((index) => (
            <PinInput.Input key={index} index={index} />
          ))}
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
