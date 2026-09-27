<script lang="ts">
  import {
    Alert,
    Badge,
    Button,
    Card,
    Skeleton,
    SparkChart,
    type BadgeVariant,
  } from "@moderno-ui/svelte";

  type KpiCardTone = "positive" | "negative" | "neutral";

  interface KpiCardMetric {
    value: string;
    delta?: string;
    tone?: KpiCardTone;
    caption?: string;
    trend?: number[];
  }

  interface Props {
    label?: string;
    period?: string;
    metric?: KpiCardMetric | null;
    actionLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    onretry?: () => void;
  }

  const sampleMetric: KpiCardMetric = {
    value: "$48,294",
    delta: "+12.5%",
    tone: "positive",
    caption: "vs last month",
    trend: [31, 34, 33, 38, 36, 41, 39, 44, 42, 47, 45, 48],
  };

  const toneBadge: Record<KpiCardTone, BadgeVariant> = {
    positive: "success",
    negative: "error",
    neutral: "neutral",
  };

  let {
    label = "Revenue",
    period = "Last 30 days",
    metric = sampleMetric,
    actionLabel = "View report",
    error,
    loading = false,
    disabled = false,
    onaction,
    onretry,
  }: Props = $props();

  const showMetric = $derived(!error && !loading && metric !== null);
  const trendPoints = $derived((metric?.trend ?? []).map((y, x) => ({ x, y })));
</script>

<section class="@container moderno-block-kpi-card text-foreground">
  <Card.Root>
    <Card.Header class="flex-row items-start justify-between gap-3">
      <div class="grid min-w-0 gap-1">
        <Card.Title>{label}</Card.Title>
        {#if period}
          <Card.Description>{period}</Card.Description>
        {/if}
      </div>
      {#if actionLabel}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="shrink-0"
          disabled={disabled || !showMetric}
          onclick={onaction}
        >
          {actionLabel}
        </Button>
      {/if}
    </Card.Header>

    <Card.Content>
      {#if error}
        <Alert.Root variant="error">
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>The number is safe; only this card failed to load.</Alert.Description>
            <Alert.Action>
              <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
      {:else if loading}
        <div
          role="status"
          aria-busy="true"
          class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between"
        >
          <span class="sr-only">Loading {label}…</span>
          <div class="grid gap-2 @sm:w-1/3">
            <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
            <Skeleton shape="text" class="w-full" />
          </div>
          <Skeleton shape="rect" class="h-12 w-full shrink-0 @sm:w-40 @md:h-14 @md:w-56 @lg:h-20 @lg:w-72" />
        </div>
      {:else if metric === null}
        <div class="grid gap-1 py-4 text-center">
          <p class="text-body font-semibold">No data yet</p>
          <p class="text-ui-md text-muted-foreground">
            This number appears once there is activity in this period.
          </p>
        </div>
      {:else}
        <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between">
          <div class="grid min-w-0 gap-2">
            <p class="font-serif text-heading tabular-nums @md:text-heading-lg">{metric.value}</p>
            {#if metric.delta}
              <p class="flex flex-wrap items-center gap-2">
                <Badge variant={toneBadge[metric.tone ?? "neutral"]} size="sm">{metric.delta}</Badge>
                {#if metric.caption}
                  <span class="text-ui-xs text-muted-foreground">{metric.caption}</span>
                {/if}
              </p>
            {/if}
          </div>
          {#if trendPoints.length > 1}
            <SparkChart
              points={trendPoints}
              width={240}
              height={64}
              area
              showLastPoint
              aria-label="{label} trend"
              class="w-full shrink-0 @sm:w-40 @md:w-56 @lg:w-72"
            />
          {/if}
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</section>
