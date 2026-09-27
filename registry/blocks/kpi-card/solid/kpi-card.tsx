import { Match, Show, Switch } from "solid-js";
import {
  Alert,
  Badge,
  Button,
  Card,
  Skeleton,
  SparkChart,
  type BadgeVariant,
} from "@moderno-ui/solid";

export type KpiCardTone = "positive" | "negative" | "neutral";

export interface KpiCardMetric {
  value: string;
  delta?: string;
  tone?: KpiCardTone;
  caption?: string;
  trend?: number[];
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

function trendPoints(trend: number[]) {
  return trend.map((y, x) => ({ x, y }));
}

export interface KpiCardProps {
  label?: string;
  period?: string;
  metric?: KpiCardMetric | null;
  actionLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function KpiCard(props: KpiCardProps) {
  const label = () => props.label ?? "Revenue";
  const period = () => props.period ?? "Last 30 days";
  const metric = () => (props.metric === undefined ? sampleMetric : props.metric);
  const actionLabel = () => props.actionLabel ?? "View report";
  const showMetric = () => !props.error && !props.loading && metric() !== null;
  const trend = () => metric()?.trend ?? [];

  return (
    <section class="@container moderno-block-kpi-card text-foreground">
      <Card.Root>
        <Card.Header class="flex-row items-start justify-between gap-3">
          <div class="grid min-w-0 gap-1">
            <Card.Title>{label()}</Card.Title>
            <Show when={period()}>
              <Card.Description>{period()}</Card.Description>
            </Show>
          </div>
          <Show when={actionLabel()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="shrink-0"
              disabled={Boolean(props.disabled) || !showMetric()}
              onClick={() => props.onAction?.()}
            >
              {actionLabel()}
            </Button>
          </Show>
        </Card.Header>

        <Card.Content>
          <Switch>
            <Match when={props.error}>
              <Alert.Root variant="error">
                <Alert.Content>
                  <Alert.Title>{props.error}</Alert.Title>
                  <Alert.Description>
                    The number is safe; only this card failed to load.
                  </Alert.Description>
                  <Alert.Action>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={props.disabled}
                      onClick={() => props.onRetry?.()}
                    >
                      Try again
                    </Button>
                  </Alert.Action>
                </Alert.Content>
              </Alert.Root>
            </Match>
            <Match when={props.loading}>
              <div
                role="status"
                aria-busy="true"
                class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between"
              >
                <span class="sr-only">Loading {label()}…</span>
                <div class="grid gap-2 @sm:w-1/3">
                  <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
                  <Skeleton shape="text" class="w-full" />
                </div>
                <Skeleton
                  shape="rect"
                  class="h-12 w-full shrink-0 @sm:w-40 @md:h-14 @md:w-56 @lg:h-20 @lg:w-72"
                />
              </div>
            </Match>
            <Match when={metric() === null}>
              <div class="grid gap-1 py-4 text-center">
                <p class="text-body font-semibold">No data yet</p>
                <p class="text-ui-md text-muted-foreground">
                  This number appears once there is activity in this period.
                </p>
              </div>
            </Match>
            <Match when={metric()}>
              {(current) => (
                <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between">
                  <div class="grid min-w-0 gap-2">
                    <p class="font-serif text-heading tabular-nums @md:text-heading-lg">
                      {current().value}
                    </p>
                    <Show when={current().delta}>
                      <p class="flex flex-wrap items-center gap-2">
                        <Badge variant={toneBadge[current().tone ?? "neutral"]} size="sm">
                          {current().delta}
                        </Badge>
                        <Show when={current().caption}>
                          <span class="text-ui-xs text-muted-foreground">{current().caption}</span>
                        </Show>
                      </p>
                    </Show>
                  </div>
                  <Show when={trend().length > 1}>
                    <SparkChart
                      points={trendPoints(trend())}
                      width={240}
                      height={64}
                      area
                      showLastPoint
                      aria-label={`${label()} trend`}
                      class="w-full shrink-0 @sm:w-40 @md:w-56 @lg:w-72"
                    />
                  </Show>
                </div>
              )}
            </Match>
          </Switch>
        </Card.Content>
      </Card.Root>
    </section>
  );
}
