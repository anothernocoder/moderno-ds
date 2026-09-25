<!--
  Theme preview gallery — the Theme Builder's stage: a masonry of realistic
  example cards (a payouts dashboard, forms, auth screens, charts, alerts)
  built from the *real* @moderno-ui/svelte primitives, so a theme is judged on
  the surfaces a product actually ships rather than on a row of swatches.

  It paints only from contract slots. Every colour here is a `var(--slot)` (or
  a color-mix of two), and it never sets a token or a `.dark` class itself: the
  host stage owns the theme, so whatever custom properties and scope the stage
  sets are exactly what every card renders with. That is also why the Select
  menu is not portalled — a portal would mount it on <body>, outside the stage,
  and the menu would paint in the page's theme instead of the one being built.

  The gallery lives inside `main`, where the docs prose layer (`docs.prose`)
  puts margins on headings, paragraphs and lists. Those rules are layered, so
  the unlayered resets below win without touching docs.css. Charts render at a
  fixed viewBox and scale to their card through CSS.
-->
<script lang="ts">
  import {
    Alert,
    AreaChart,
    BarChart,
    Button,
    Card,
    Checkbox,
    Divider,
    Field,
    LineChart,
    PinInput,
    Select,
    createListCollection,
  } from "@moderno-ui/svelte";
  import { curveMonotoneX } from "@moderno-ui/charts-core";

  // — Contribution history —
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const contributions = [{ name: "Contributions", values: [420, 380, 510, 460, 620, 580] }];

  // — Payout threshold / preferences —
  const currencies = createListCollection({
    items: [
      { label: "USD", value: "usd" },
      { label: "EUR", value: "eur" },
      { label: "GBP", value: "gbp" },
      { label: "JPY", value: "jpy" },
    ],
  });
  const schedules = createListCollection({
    items: [
      { label: "Weekly", value: "weekly" },
      { label: "Every two weeks", value: "biweekly" },
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
    ],
  });

  // — Holdings —
  const holdings = [
    {
      symbol: "VT",
      name: "Vanguard Total World",
      units: "42 shares",
      value: "$4,812.60",
      change: 2.4,
      spark: [4, 6, 5, 7, 6, 8, 9, 11],
    },
    {
      symbol: "BND",
      name: "Total Bond Market",
      units: "30 shares",
      value: "$2,176.20",
      change: -0.6,
      spark: [8, 7, 7, 6, 7, 6, 6, 5],
    },
    {
      symbol: "GLD",
      name: "Gold Trust",
      units: "8 shares",
      value: "$1,694.32",
      change: 1.1,
      spark: [5, 5, 6, 6, 5, 7, 7, 8],
    },
    {
      symbol: "CSH",
      name: "Cash reserve",
      units: "High-yield",
      value: "$960.00",
      change: 0.3,
      spark: [6, 6, 6, 7, 7, 7, 7, 7],
    },
  ];

  // — Listeners (area) —
  const monthLabels = [...months, "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const toPoints = (values: number[]) => values.map((y, x) => ({ x, y }));
  const listeners = [
    { name: "Streams", points: toPoints([18, 22, 21, 27, 31, 29, 36, 40, 38, 44, 47, 52]) },
    { name: "Saves", points: toPoints([6, 8, 7, 10, 12, 11, 14, 15, 17, 18, 21, 24]) },
  ];

  // — Weekly engagement (line) —
  type Range = "7d" | "30d" | "90d";
  interface RangeData {
    labels: string[];
    plays: number[];
    saves: number[];
    shares: number[];
  }
  const ranges: Record<Range, RangeData> = {
    "7d": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      plays: [32, 41, 38, 52, 49, 63, 58],
      saves: [12, 18, 15, 22, 20, 27, 31],
      shares: [4, 7, 6, 9, 12, 10, 14],
    },
    "30d": {
      labels: ["W1", "W2", "W3", "W4", "W5"],
      plays: [210, 248, 236, 290, 312],
      saves: [80, 96, 110, 104, 131],
      shares: [22, 30, 28, 41, 45],
    },
    "90d": {
      labels: ["Apr", "May", "Jun"],
      plays: [880, 1040, 1210],
      saves: [320, 390, 470],
      shares: [95, 120, 160],
    },
  };
  const rangeKeys: Range[] = ["7d", "30d", "90d"];
  let range = $state<Range>("7d");
  const engagement = $derived.by(() => {
    const r = ranges[range];
    return [
      { name: "Plays", points: toPoints(r.plays) },
      { name: "Saves", points: toPoints(r.saves) },
      { name: "Shares", points: toPoints(r.shares) },
    ];
  });
  const engagementLabels = $derived(ranges[range].labels);

  // — Audience by platform: one share per chart slot, so all five show —
  const platforms = [
    { name: "Spotify", share: 42 },
    { name: "Apple Music", share: 24 },
    { name: "YouTube Music", share: 16 },
    { name: "Amazon Music", share: 11 },
    { name: "Other", share: 7 },
  ];

  // — Pricing —
  const features = [
    "Unlimited releases",
    "Split payments with collaborators",
    "Pre-save campaigns",
    "Priority support",
  ];

  const pinCells = [0, 1, 2, 3, 4, 5];

  // Icon paths (24×24, stroked with currentColor — primitives are icon-agnostic).
  const circle = "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z";
  const icons = {
    chevron: "m6 9 6 6 6-6",
    plus: "M12 5v14M5 12h14",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
    info: `M12 16v-4M12 8h.01${circle}`,
    success: `m8 12 2.5 2.5L16 9${circle}`,
    warning: `M12 8v4M12 16h.01${circle}`,
    error: `m15 9-6 6M9 9l6 6${circle}`,
    github:
      "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 " +
      "0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 " +
      "0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4M9 18c-4.51 2-5-2-7-2",
  };
</script>

{#snippet icon(d: string, size = 16)}
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path {d} />
  </svg>
{/snippet}

{#snippet check()}
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
{/snippet}

{#snippet selectItems(items: { label: string; value: string }[])}
  <Select.Positioner>
    <Select.Content>
      {#each items as item (item.value)}
        <Select.Item {item}>
          <Select.ItemText>{item.label}</Select.ItemText>
          <Select.ItemIndicator>{@render check()}</Select.ItemIndicator>
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Positioner>
{/snippet}

<div class="tpg">
  <!-- Contribution history: bar chart, stat tiles, full-width primary action -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Contribution history</Card.Title>
      <Card.Description>Monthly deposits over the last 6 months.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-figure">
        <span class="tpg-amount">$2,970.00</span>
        <span class="tpg-delta tpg-delta--up">+14.2%</span>
      </div>
      <div class="tpg-chart tpg-chart--no-y">
        <BarChart
          width={320}
          height={140}
          margin={{ top: 8, right: 0, bottom: 22, left: 0 }}
          categories={months}
          series={contributions}
          yTicks={3}
          padding={0.3}
          aria-label="Monthly contributions, January to June"
        />
      </div>
      <div class="tpg-tiles">
        <div class="tpg-tile">
          <span class="tpg-tile-label">Upcoming</span>
          <span class="tpg-tile-value">May 25</span>
        </div>
        <div class="tpg-tile">
          <span class="tpg-tile-label">Auto-save plan</span>
          <span class="tpg-tile-value">Accelerated</span>
        </div>
      </div>
      <div class="tpg-fill">
        <Button>Adjust plan</Button>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Claimable balance: big number, status chip, line items -->
  <Card.Root size="sm">
    <Card.Header>
      <div class="tpg-row">
        <Card.Title>Claimable balance</Card.Title>
        <span class="tpg-chip tpg-chip--outline">
          <span class="tpg-dot tpg-dot--warning"></span>Pending
        </span>
      </div>
      <Card.Description>Available once your next payout clears.</Card.Description>
    </Card.Header>
    <Card.Content>
      <span class="tpg-amount tpg-amount--xl">$0.00</span>
      <div class="tpg-lines">
        <div class="tpg-line"><span>Streaming royalties</span><span>$1,284.20</span></div>
        <div class="tpg-line"><span>Downloads</span><span>$312.00</span></div>
        <div class="tpg-line"><span>Platform fees</span><span>−$96.40</span></div>
        <Divider />
        <div class="tpg-line tpg-line--total"><span>In review</span><span>$1,499.80</span></div>
      </div>
      <span class="tpg-note">Balances under your $50.00 threshold roll over to next month.</span>
    </Card.Content>
    <Card.Footer>
      <Button size="sm">Claim</Button>
      <Button size="sm" variant="outline">View history</Button>
    </Card.Footer>
  </Card.Root>

  <!-- Holdings: list rows with tiny bar sparklines -->
  <Card.Root size="sm">
    <Card.Header>
      <div class="tpg-row">
        <Card.Title>Holdings</Card.Title>
        <span class="tpg-chip tpg-chip--secondary">4 assets</span>
      </div>
      <Card.Description>Total value $9,643.12</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-holdings">
        {#each holdings as h (h.symbol)}
          <div class="tpg-holding">
            <span class="tpg-avatar">{h.symbol}</span>
            <span class="tpg-holding-name">
              <span class="tpg-strong">{h.name}</span>
              <span class="tpg-muted">{h.units}</span>
            </span>
            <span class="tpg-spark" class:tpg-spark--down={h.change < 0}>
              <BarChart
                width={64}
                height={24}
                margin={{ top: 1, right: 0, bottom: 1, left: 0 }}
                categories={h.spark.map((_, i) => String(i))}
                series={[{ name: h.symbol, values: h.spark }]}
                yDomain={[0, 12]}
                padding={0.25}
                aria-label={`${h.name}, last 8 weeks`}
              />
            </span>
            <span class="tpg-holding-value">
              <span class="tpg-strong">{h.value}</span>
              <span
                class="tpg-delta"
                class:tpg-delta--up={h.change > 0}
                class:tpg-delta--down={h.change < 0}
              >
                {h.change > 0 ? "+" : ""}{h.change.toFixed(1)}%
              </span>
            </span>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Payout threshold: select + input + textarea form -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Payout threshold</Card.Title>
      <Card.Description>
        We pay out automatically once your balance reaches this amount.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-form-row">
        <Select.Root
          collection={currencies}
          defaultValue={["usd"]}
          positioning={{ strategy: "fixed" }}
        >
          <Select.Label>Currency</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Currency" />
              <Select.Indicator>{@render icon(icons.chevron, 14)}</Select.Indicator>
            </Select.Trigger>
          </Select.Control>
          {@render selectItems(currencies.items)}
        </Select.Root>
        <Field.Root>
          <Field.Label>Amount</Field.Label>
          <Field.Input inputmode="decimal" value="250.00" />
        </Field.Root>
      </div>
      <Field.Root>
        <Field.Label>Notes</Field.Label>
        <Field.Textarea rows={3} placeholder="Anything our payments team should know" />
        <Field.HelperText>Only visible to your team.</Field.HelperText>
      </Field.Root>
    </Card.Content>
    <Card.Footer>
      <Button size="sm" variant="ghost">Cancel</Button>
      <Button size="sm">Save threshold</Button>
    </Card.Footer>
  </Card.Root>

  <!-- Listeners: area chart, two series -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Description>Monthly listeners</Card.Description>
      <div class="tpg-figure">
        <span class="tpg-amount tpg-amount--xl">48,210</span>
        <span class="tpg-delta tpg-delta--up">+12.4%</span>
      </div>
    </Card.Header>
    <Card.Content>
      <div class="tpg-chart tpg-chart--no-y">
        <AreaChart
          width={320}
          height={150}
          margin={{ top: 8, right: 14, bottom: 22, left: 14 }}
          series={listeners}
          xTicks={6}
          yTicks={3}
          curve={curveMonotoneX}
          format={(v) => monthLabels[v] ?? ""}
          aria-label="Streams and saves per month"
        />
      </div>
      <div class="tpg-legend">
        <span><span class="tpg-swatch" style="background: var(--chart-1)"></span>Streams</span>
        <span><span class="tpg-swatch" style="background: var(--chart-2)"></span>Saves</span>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Distribute track: empty state -->
  <Card.Root size="sm">
    <Card.Content>
      <div class="tpg-empty">
        <span class="tpg-empty-icon">{@render icon(icons.plus, 20)}</span>
        <span class="tpg-heading">Distribute a track</span>
        <span class="tpg-muted">
          Upload a master and artwork, and we send it to 150+ stores and streaming services.
        </span>
        <div class="tpg-actions">
          <Button size="sm">Create release</Button>
          <Button size="sm" variant="outline">Import CSV</Button>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Sign in: fields, checkbox, labelled divider -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Sign in</Card.Title>
      <Card.Description>Enter your email and password to continue.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-fill">
        <Button variant="outline">
          {@render icon(icons.github)}
          Continue with GitHub
        </Button>
      </div>
      <Divider>or</Divider>
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Input type="email" placeholder="you@example.com" autocomplete="off" />
      </Field.Root>
      <Field.Root>
        <div class="tpg-row">
          <Field.Label>Password</Field.Label>
          <button type="button" class="tpg-link">Forgot password?</button>
        </div>
        <Field.Input type="password" value="correct-horse" autocomplete="off" />
      </Field.Root>
      <Checkbox.Root defaultChecked>
        <Checkbox.Control>
          <Checkbox.Indicator>{@render check()}</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Keep me signed in</Checkbox.Label>
        <Checkbox.HiddenInput />
      </Checkbox.Root>
      <div class="tpg-fill">
        <Button>Sign in</Button>
      </div>
    </Card.Content>
    <Card.Footer>
      <span class="tpg-muted">
        New here?
        <button type="button" class="tpg-link tpg-link--strong">Create an account</button>
      </span>
    </Card.Footer>
  </Card.Root>

  <!-- Preferences: select + checkbox rows with descriptions + footer -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Preferences</Card.Title>
      <Card.Description>How and when we tell you about money moving.</Card.Description>
    </Card.Header>
    <Card.Content>
      <Select.Root
        collection={schedules}
        defaultValue={["monthly"]}
        size="sm"
        positioning={{ strategy: "fixed" }}
      >
        <Select.Label>Payout schedule</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Schedule" />
            <Select.Indicator>{@render icon(icons.chevron, 14)}</Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        {@render selectItems(schedules.items)}
      </Select.Root>
      <div class="tpg-prefs">
        <Checkbox.Root defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>{@render check()}</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>
            <span class="tpg-pref-title">Payout receipts</span>
            <span class="tpg-pref-desc">An email each time money lands in your bank.</span>
          </Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root defaultChecked>
          <Checkbox.Control>
            <Checkbox.Indicator>{@render check()}</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>
            <span class="tpg-pref-title">Low balance alerts</span>
            <span class="tpg-pref-desc">When a pending payout drops below the threshold.</span>
          </Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Checkbox.Root>
          <Checkbox.Control>
            <Checkbox.Indicator>{@render check()}</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label>
            <span class="tpg-pref-title">Weekly digest</span>
            <span class="tpg-pref-desc">A Monday summary of streams and earnings.</span>
          </Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
      </div>
    </Card.Content>
    <Card.Footer>
      <div class="tpg-footer-end">
        <Button size="sm" variant="outline">Reset</Button>
        <Button size="sm">Save</Button>
      </div>
    </Card.Footer>
  </Card.Root>

  <!-- Verify email: pin input -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Verify your email</Card.Title>
      <Card.Description>Enter the 6-digit code we sent to m•••@example.com.</Card.Description>
    </Card.Header>
    <Card.Content>
      <PinInput.Root count={pinCells.length} otp defaultValue={["4", "8", "1"]}>
        <PinInput.Label>Verification code</PinInput.Label>
        <PinInput.Control>
          {#each pinCells as index (index)}
            <PinInput.Input {index} />
          {/each}
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>
      <span class="tpg-note">The code expires in 4:59.</span>
    </Card.Content>
    <Card.Footer>
      <Button size="sm">Verify</Button>
      <Button size="sm" variant="ghost">Resend code</Button>
    </Card.Footer>
  </Card.Root>

  <!-- Weekly engagement: line chart, three series, segmented range -->
  <Card.Root size="sm">
    <Card.Header>
      <div class="tpg-row">
        <Card.Title>Engagement</Card.Title>
        <div class="tpg-seg" role="group" aria-label="Range">
          {#each rangeKeys as r (r)}
            <button type="button" aria-pressed={range === r} onclick={() => (range = r)}>
              {r}
            </button>
          {/each}
        </div>
      </div>
      <Card.Description>Plays, saves and shares across all releases.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-chart tpg-chart--no-y">
        <LineChart
          width={320}
          height={150}
          margin={{ top: 8, right: 14, bottom: 22, left: 14 }}
          series={engagement}
          xTicks={engagementLabels.length - 1}
          yTicks={3}
          curve={curveMonotoneX}
          format={(v) => engagementLabels[v] ?? ""}
          aria-label="Plays, saves and shares over time"
        />
      </div>
      <div class="tpg-legend">
        <span><span class="tpg-swatch" style="background: var(--chart-1)"></span>Plays</span>
        <span><span class="tpg-swatch" style="background: var(--chart-2)"></span>Saves</span>
        <span><span class="tpg-swatch" style="background: var(--chart-3)"></span>Shares</span>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Notifications: every alert status -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Notifications</Card.Title>
      <Card.Description>What happened while you were away.</Card.Description>
    </Card.Header>
    <Card.Content>
      <Alert.Root variant="info" size="sm">
        <Alert.Icon>{@render icon(icons.info)}</Alert.Icon>
        <Alert.Content>
          <Alert.Title>Payout scheduled</Alert.Title>
          <Alert.Description>$1,499.80 is on its way for May 25.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Alert.Root variant="success" size="sm">
        <Alert.Icon>{@render icon(icons.success)}</Alert.Icon>
        <Alert.Content>
          <Alert.Title>Release approved</Alert.Title>
          <Alert.Description>“Midnight Drive” goes live on Friday.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Alert.Root variant="warning" size="sm">
        <Alert.Icon>{@render icon(icons.warning)}</Alert.Icon>
        <Alert.Content>
          <Alert.Title>Card expiring</Alert.Title>
          <Alert.Description>The card ending 4242 expires next month.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Alert.Root variant="error" size="sm">
        <Alert.Icon>{@render icon(icons.error)}</Alert.Icon>
        <Alert.Content>
          <Alert.Title>Upload failed</Alert.Title>
          <Alert.Description>The artwork must be at least 3000 × 3000 px.</Alert.Description>
          <Alert.Action>
            <Button size="sm" variant="outline">Replace artwork</Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    </Card.Content>
  </Card.Root>

  <!-- Savings goal: progress -->
  <Card.Root size="sm">
    <Card.Header>
      <div class="tpg-row">
        <Card.Title>Studio fund</Card.Title>
        <span class="tpg-chip tpg-chip--outline">
          <span class="tpg-dot tpg-dot--success"></span>On track
        </span>
      </div>
      <Card.Description>Goal: $10,000 by December.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-figure">
        <span class="tpg-amount tpg-amount--xl">$6,240</span>
        <span class="tpg-muted">of $10,000</span>
      </div>
      <div
        class="tpg-progress"
        role="progressbar"
        aria-label="Studio fund progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={62}
      >
        <span style="width: 62%"></span>
      </div>
      <div class="tpg-tiles tpg-tiles--3">
        <div class="tpg-tile">
          <span class="tpg-tile-label">Monthly</span>
          <span class="tpg-tile-value">$520</span>
        </div>
        <div class="tpg-tile">
          <span class="tpg-tile-label">Left</span>
          <span class="tpg-tile-value">7 mo</span>
        </div>
        <div class="tpg-tile">
          <span class="tpg-tile-label">Done</span>
          <span class="tpg-tile-value">62%</span>
        </div>
      </div>
    </Card.Content>
    <Card.Footer>
      <Button size="sm" variant="secondary">Pause</Button>
      <Button size="sm">Add funds</Button>
    </Card.Footer>
  </Card.Root>

  <!-- Destructive confirmation: a static popover surface -->
  <div class="tpg-popover" role="group" aria-label="Delete release confirmation">
    <div class="tpg-popover-head">
      <span class="tpg-popover-icon">{@render icon(icons.trash)}</span>
      <span class="tpg-heading">Delete “Midnight Drive”?</span>
    </div>
    <span class="tpg-muted">
      This removes the release from every store within 48 hours. Earnings you already made stay
      in your balance.
    </span>
    <Checkbox.Root size="sm">
      <Checkbox.Control>
        <Checkbox.Indicator>{@render check()}</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Also remove it from my playlists</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <div class="tpg-footer-end">
      <Button size="sm" variant="outline">Cancel</Button>
      <Button size="sm" variant="destructive">Delete release</Button>
    </div>
  </div>

  <!-- Audience by platform: the five chart slots side by side -->
  <Card.Root size="sm">
    <Card.Header>
      <Card.Title>Audience by platform</Card.Title>
      <Card.Description>Share of streams, last 28 days.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-stack-bar" aria-hidden="true">
        {#each platforms as p, i (p.name)}
          <span style={`flex: ${p.share}; background: var(--chart-${i + 1})`}></span>
        {/each}
      </div>
      <div class="tpg-lines">
        {#each platforms as p, i (p.name)}
          <div class="tpg-line">
            <span>
              <span class="tpg-swatch" style={`background: var(--chart-${i + 1})`}></span>{p.name}
            </span>
            <span>{p.share}%</span>
          </div>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Pricing: accent chip, feature list, primary action -->
  <Card.Root size="sm">
    <Card.Header>
      <div class="tpg-row">
        <Card.Title>Pro</Card.Title>
        <span class="tpg-chip tpg-chip--accent">Most popular</span>
      </div>
      <Card.Description>For artists releasing every month.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="tpg-figure">
        <span class="tpg-amount tpg-amount--xl">$24</span>
        <span class="tpg-muted">/ month</span>
      </div>
      <ul class="tpg-features">
        {#each features as f (f)}
          <li><span class="tpg-feature-icon">{@render check()}</span>{f}</li>
        {/each}
      </ul>
      <div class="tpg-fill">
        <Button>Upgrade to Pro</Button>
      </div>
      <span class="tpg-note tpg-center">Billed yearly. Cancel anytime.</span>
    </Card.Content>
  </Card.Root>
</div>

<style>
  /* Masonry by multi-column: the count follows the stage width (one column on a
     phone, up to four on a wide stage) and every item refuses to split. */
  .tpg {
    columns: 4 17rem;
    column-gap: 1rem;
    font-family: var(--font-sans);
    color: var(--foreground);
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .tpg > :global(*) {
    break-inside: avoid;
    margin-bottom: 1rem;
  }

  /* Neutralise the docs prose layer (margins on h3/p/ul/li, and its colours on
     li/strong) for everything inside the gallery. Unlayered, so these win over
     `docs.prose` — but they only reset spacing; colours stay with the
     components' own layered rules. */
  .tpg :global(:is(h1, h2, h3, h4, p, ul, ol, li)) {
    margin: 0;
    letter-spacing: normal;
  }

  /* Ghost buttons assume a preflight has made <button> transparent; the docs
     page only ships one inside `.preview-panel--demo`, so outside it the UA's
     `buttonface` shows through. Restated in `moderno.base` (not unlayered) so
     every variant fill and hover in `moderno.components` still wins. */
  @layer moderno.base {
    .tpg :global([data-scope="button"][data-part="root"]) {
      background-color: transparent;
    }
  }

  /* Tighten the card title — the shadcn-dense voice. */
  .tpg :global([data-scope="card"][data-part="title"]) {
    font-size: 0.9375rem;
    line-height: 1.4;
  }
  .tpg :global([data-scope="card"][data-part="description"]) {
    font-size: 0.8125rem;
  }
  .tpg :global([data-scope="card"][data-part="content"]) {
    font-size: 0.8125rem;
  }

  /* The Select menu is rendered in place (not portalled), so lift it over the
     cards in later columns. Zag copies the content's z-index to its
     positioner. */
  .tpg :global([data-scope="select"][data-part="content"]) {
    z-index: 30;
    max-height: 16rem;
    overflow-y: auto;
  }
  /* Ark wraps the trigger in a block-level Control, so the inline-flex trigger
     would shrink to its value; a form control spans its field. */
  .tpg :global([data-scope="select"][data-part="trigger"]) {
    width: 100%;
  }
  .tpg :global([data-scope="select"][data-part="label"]) {
    line-height: 1.4;
  }
  .tpg :global([data-scope="select"][data-part="value-text"]) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tpg :global([data-scope="select"][data-part="indicator"]) {
    display: inline-flex;
    color: var(--muted-foreground);
  }
  /* Unlayered display rules would beat components.css's layered `[hidden]`
     guard and re-show inactive parts, so never touch a hidden one. */
  .tpg :global([data-scope="select"][data-part="item-indicator"]:not([hidden])) {
    display: inline-flex;
  }

  /* Shared bits */
  .tpg-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-width: 0;
  }
  .tpg-heading {
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--foreground);
  }
  .tpg-strong {
    font-weight: 500;
    color: var(--foreground);
  }
  .tpg-muted {
    color: var(--muted-foreground);
  }
  .tpg-note {
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }
  .tpg-center {
    text-align: center;
  }
  .tpg-figure {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
  }
  .tpg-amount {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }
  .tpg-amount--xl {
    font-size: 1.875rem;
    letter-spacing: -0.02em;
  }
  .tpg-delta {
    font-size: 0.75rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--muted-foreground);
  }
  .tpg-delta--up {
    color: var(--success);
  }
  .tpg-delta--down {
    color: var(--destructive);
  }

  /* Full-width buttons */
  .tpg-fill {
    display: flex;
    flex-direction: column;
  }
  .tpg-fill :global([data-scope="button"][data-part="root"]) {
    width: 100%;
  }
  .tpg-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .tpg-footer-end {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  /* Chips */
  .tpg-chip {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.375rem;
    height: 1.375rem;
    padding: 0 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--radius);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }
  .tpg-chip--secondary {
    background: var(--secondary);
    color: var(--secondary-foreground);
  }
  .tpg-chip--accent {
    background: var(--accent);
    color: var(--accent-foreground);
  }
  .tpg-chip--outline {
    border-color: var(--border);
    color: var(--foreground);
  }
  .tpg-dot {
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
  }
  .tpg-dot--warning {
    background: var(--warning);
  }
  .tpg-dot--success {
    background: var(--success);
  }
  .tpg-swatch {
    display: inline-block;
    flex-shrink: 0;
    width: 0.625rem;
    height: 0.625rem;
    margin-right: 0.375rem;
    border-radius: 2px;
    vertical-align: -0.05em;
  }

  /* Links */
  .tpg-link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--muted-foreground);
    font: inherit;
    font-size: 0.8125rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  .tpg-link:hover {
    color: var(--foreground);
  }
  .tpg-link--strong {
    color: var(--foreground);
    font-weight: 500;
  }
  .tpg-link:focus-visible,
  .tpg-seg button:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  /* Charts: fixed viewBox, scaled to the card. */
  .tpg-chart :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
  .tpg-chart--no-y :global([data-part="tick-label"][data-orientation="y"]),
  .tpg-chart--no-y :global([data-part="axis-line"]) {
    display: none;
  }
  .tpg-chart :global([data-part="grid-line"]) {
    stroke-dasharray: 3 3;
  }
  .tpg-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  /* Stat tiles */
  .tpg-tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .tpg-tiles--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .tpg-tile {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius);
    background: var(--muted);
  }
  .tpg-tile-label {
    overflow: hidden;
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tpg-tile-value {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }

  /* Line items */
  .tpg-lines {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tpg-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--muted-foreground);
  }
  .tpg-line > span:last-child {
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }
  .tpg-line--total {
    font-weight: 600;
    color: var(--foreground);
  }

  /* Holdings */
  .tpg-holdings {
    display: flex;
    flex-direction: column;
  }
  .tpg-holding {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0;
    border-top: 1px solid var(--border);
  }
  .tpg-holding:first-child {
    padding-top: 0;
    border-top: 0;
  }
  .tpg-holding:last-child {
    padding-bottom: 0;
  }
  .tpg-avatar {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radius);
    background: var(--secondary);
    color: var(--secondary-foreground);
    font-size: 0.6875rem;
    font-weight: 600;
  }
  .tpg-holding-name,
  .tpg-holding-value {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.35;
  }
  .tpg-holding-name {
    flex: 1;
  }
  .tpg-holding-name > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tpg-holding-name .tpg-muted {
    font-size: 0.75rem;
  }
  .tpg-holding-value {
    align-items: flex-end;
    font-variant-numeric: tabular-nums;
  }
  .tpg-spark {
    flex-shrink: 0;
    width: 4rem;
  }
  .tpg-spark :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
  .tpg-spark :global(:is([data-part="tick-label"], [data-part="grid"], [data-part="axis-line"])) {
    display: none;
  }
  .tpg-spark--down :global([data-part="series"]) {
    color: var(--muted-foreground);
  }

  /* Forms */
  .tpg-form-row {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
    align-items: start;
    gap: 0.75rem;
  }
  .tpg :global([data-scope="field"][data-part="textarea"]) {
    resize: vertical;
  }
  .tpg-prefs {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding-top: 0.25rem;
  }
  .tpg-prefs :global([data-scope="checkbox"][data-part="root"]) {
    align-items: flex-start;
    gap: 0.625rem;
  }
  .tpg-prefs :global([data-scope="checkbox"][data-part="control"]) {
    margin-top: 0.125rem;
  }
  .tpg-pref-title {
    display: block;
    font-weight: 500;
    color: var(--foreground);
  }
  .tpg-pref-desc {
    display: block;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--muted-foreground);
  }

  /* Empty state */
  .tpg-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1.5rem 1rem;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    text-align: center;
  }
  .tpg-empty-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 0.375rem;
    border-radius: 50%;
    background: var(--muted);
    color: var(--muted-foreground);
  }
  .tpg-empty .tpg-muted {
    max-width: 18rem;
  }

  /* Segmented range control */
  .tpg-seg {
    display: inline-flex;
    flex-shrink: 0;
    padding: 2px;
    border-radius: var(--radius);
    background: var(--muted);
  }
  .tpg-seg button {
    height: 1.5rem;
    padding: 0 0.5rem;
    border: 0;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--muted-foreground);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
  }
  .tpg-seg button[aria-pressed="true"] {
    background: var(--background);
    color: var(--foreground);
    box-shadow: var(--shadow-sm);
  }

  /* Progress */
  .tpg-progress {
    height: 0.5rem;
    overflow: hidden;
    border-radius: var(--radius);
    background: var(--secondary);
  }
  .tpg-progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--primary);
  }

  /* Stacked share bar */
  .tpg-stack-bar {
    display: flex;
    gap: 2px;
    height: 0.625rem;
    overflow: hidden;
    border-radius: var(--radius);
  }
  .tpg-stack-bar span {
    min-width: 2px;
  }

  /* Features */
  .tpg-features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    list-style: none;
  }
  .tpg-features li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--foreground);
    line-height: 1.4;
  }
  .tpg-feature-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .tpg-feature-icon :global(svg) {
    width: 0.625rem;
    height: 0.625rem;
  }

  /* Static popover (the dialog surface, without the modal machinery) */
  .tpg-popover {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow-lg);
  }
  .tpg-popover-head {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .tpg-popover .tpg-heading {
    color: var(--popover-foreground);
  }
  .tpg-popover-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: color-mix(in oklab, var(--destructive) 12%, var(--popover));
    color: var(--destructive);
  }
</style>
