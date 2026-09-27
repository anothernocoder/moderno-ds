import {
  Alert,
  Badge,
  Button,
  Card,
  Skeleton,
  SparkChart,
  type BadgeVariant,
} from "@moderno-ui/react";

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

export function KpiCard({
  label = "Revenue",
  period = "Last 30 days",
  metric = sampleMetric,
  actionLabel = "View report",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: KpiCardProps) {
  const showMetric = !error && !loading && metric !== null;
  const trend = metric?.trend ?? [];

  return (
    <section className="@container moderno-block-kpi-card text-foreground">
      <Card.Root>
        <Card.Header className="flex-row items-start justify-between gap-3">
          <div className="grid min-w-0 gap-1">
            <Card.Title>{label}</Card.Title>
            {period ? <Card.Description>{period}</Card.Description> : null}
          </div>
          {actionLabel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              disabled={disabled || !showMetric}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </Card.Header>

        <Card.Content>
          {error ? (
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
                <Alert.Description>
                  The number is safe; only this card failed to load.
                </Alert.Description>
                <Alert.Action>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                </Alert.Action>
              </Alert.Content>
            </Alert.Root>
          ) : loading ? (
            <div
              role="status"
              aria-busy="true"
              className="grid gap-4 @sm:flex @sm:items-end @sm:justify-between"
            >
              <span className="sr-only">Loading {label}…</span>
              <div className="grid gap-2 @sm:w-1/3">
                <Skeleton shape="text" className="h-8 w-2/3 @md:h-10" />
                <Skeleton shape="text" className="w-full" />
              </div>
              <Skeleton
                shape="rect"
                className="h-12 w-full shrink-0 @sm:w-40 @md:h-14 @md:w-56 @lg:h-20 @lg:w-72"
              />
            </div>
          ) : metric === null ? (
            <div className="grid gap-1 py-4 text-center">
              <p className="text-body font-semibold">No data yet</p>
              <p className="text-ui-md text-muted-foreground">
                This number appears once there is activity in this period.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 @sm:flex @sm:items-end @sm:justify-between">
              <div className="grid min-w-0 gap-2">
                <p className="font-serif text-heading tabular-nums @md:text-heading-lg">
                  {metric.value}
                </p>
                {metric.delta ? (
                  <p className="flex flex-wrap items-center gap-2">
                    <Badge variant={toneBadge[metric.tone ?? "neutral"]} size="sm">
                      {metric.delta}
                    </Badge>
                    {metric.caption ? (
                      <span className="text-ui-xs text-muted-foreground">{metric.caption}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
              {trend.length > 1 ? (
                <SparkChart
                  points={trendPoints(trend)}
                  width={240}
                  height={64}
                  area
                  showLastPoint
                  aria-label={`${label} trend`}
                  className="w-full shrink-0 @sm:w-40 @md:w-56 @lg:w-72"
                />
              ) : null}
            </div>
          )}
        </Card.Content>
      </Card.Root>
    </section>
  );
}
