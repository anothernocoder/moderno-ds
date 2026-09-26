<!--
  SSR playground — the Svelte twin of the React harness, and the proof of F3.5:
  this component renders server-only (no client: directive) to static HTML, i.e.
  it works as an Astro island with zero client runtime. `open` mounts the Dialog
  + Select popovers.
-->
<script lang="ts">
  import { Alert } from "../src/index.js";
  import { Callout } from "../src/index.js";
  import { Button } from "../src/index.js";
  import { Divider } from "../src/index.js";
  import { Badge, Chip, Indicator } from "../src/index.js";
  import { Skeleton, Spinner } from "../src/index.js";
  import { Card } from "../src/index.js";
  import { Field } from "../src/index.js";
  import { Avatar } from "../src/index.js";
  import { Checkbox } from "../src/index.js";
  import { Switch } from "../src/index.js";
  import { RadioGroup } from "../src/index.js";
  import { Toggle, ToggleGroup } from "../src/index.js";
  import { Tabs } from "../src/index.js";
  import { Accordion } from "../src/index.js";
  import { Progress } from "../src/index.js";
  import { Slider } from "../src/index.js";
  import { NumberInput } from "../src/index.js";
  import { Pagination } from "../src/index.js";
  import { Dialog, Portal } from "../src/index.js";
  import { Select, createListCollection } from "../src/index.js";
  import { PinInput } from "../src/index.js";
  import { AreaChart, BarChart, LineChart, ScatterChart } from "../src/index.js";

  let { open = false }: { open?: boolean } = $props();

  // A shared sample dataset for the four chart examples (Phase 4 deliverable).
  const sales = [
    { name: "2023", points: [
      { x: 0, y: 10 }, { x: 1, y: 40 }, { x: 2, y: 30 }, { x: 3, y: 55 }, { x: 4, y: 48 },
    ] },
    { name: "2024", points: [
      { x: 0, y: 5 }, { x: 1, y: 18 }, { x: 2, y: 25 }, { x: 3, y: 22 }, { x: 4, y: 35 },
    ] },
  ];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const revenue = [{ name: "revenue", values: [12, 28, 19, 34] }];

  // A six-digit one-time code: the cell indices the PinInput renders. `count` on
  // the Root tells Ark the same number so the server-rendered aria labels match.
  const codeCells = [0, 1, 2, 3, 4, 5];

  const frameworks = createListCollection({
    items: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Svelte", value: "svelte" },
      { label: "Solid", value: "solid" },
    ],
  });
</script>

<main>
  <section aria-label="buttons">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost" size="sm">Ghost</Button>
    <Button variant="destructive" size="lg">Destructive</Button>
  </section>

  <section aria-label="dividers">
    <Divider />
    <Divider align="start">Or</Divider>
    <Divider orientation="vertical" />
    <Divider orientation="vertical">Or</Divider>
  </section>

  <section aria-label="badges">
    <Badge>Draft</Badge>
    <Badge variant="success" dot>Paid</Badge>
    <Badge variant="error" size="sm">Overdue</Badge>
  </section>

  <section aria-label="chips">
    <Chip>Design</Chip>
    <Chip variant="muted" size="sm" removable removeLabel="Remove React">React</Chip>
  </section>

  <section aria-label="indicators">
    <Indicator variant="success" pulse>Online</Indicator>
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
          <Button size="sm" variant="outline">Manage plan</Button>
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
      <Button variant="outline" size="sm">Export</Button>
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
      <Toggle.Indicator>
        {#snippet fallback()}☆{/snippet}
        ★
      </Toggle.Indicator>
      Favorite
    </Toggle.Root>
    <Toggle.Root variant="outline" size="sm" disabled>
      <Toggle.Indicator>
        {#snippet fallback()}☆{/snippet}
        ★
      </Toggle.Indicator>
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
        <Tabs.Trigger value="billing" disabled>Billing</Tabs.Trigger>
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

  <section aria-label="pagination">
    <Pagination.Root count={100} pageSize={10} defaultPage={5}>
      <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
      <Pagination.Context>
        {#snippet render(pagination)}
          {#each pagination().pages as page, index (index)}
            {#if page.type === "page"}
              <Pagination.Item {...page}>{page.value}</Pagination.Item>
            {:else}
              <Pagination.Ellipsis {index}>…</Pagination.Ellipsis>
            {/if}
          {/each}
        {/snippet}
      </Pagination.Context>
      <Pagination.NextTrigger>›</Pagination.NextTrigger>
    </Pagination.Root>
    <Pagination.Root size="sm" count={30} pageSize={10}>
      <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
      <Pagination.Context>
        {#snippet render(pagination)}
          {#each pagination().pages as page, index (index)}
            {#if page.type === "page"}
              <Pagination.Item {...page}>{page.value}</Pagination.Item>
            {:else}
              <Pagination.Ellipsis {index}>…</Pagination.Ellipsis>
            {/if}
          {/each}
        {/snippet}
      </Pagination.Context>
      <Pagination.NextTrigger>›</Pagination.NextTrigger>
    </Pagination.Root>
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
          {#each frameworks.items as item (item.value)}
            <Select.Item {item}>
              <Select.ItemText>{item.label}</Select.ItemText>
              <Select.ItemIndicator>✓</Select.ItemIndicator>
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Positioner>
    </Portal>
  </Select.Root>

  <PinInput.Root count={codeCells.length} otp size="md">
    <PinInput.Label>Verification code</PinInput.Label>
    <PinInput.Control>
      {#each codeCells as index (index)}
        <PinInput.Input {index} />
      {/each}
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
