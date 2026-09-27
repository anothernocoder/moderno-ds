import { Alert, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/react";

export type StatRowTone = "positive" | "negative" | "neutral";

export interface StatRowItem {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: StatRowTone;
  caption?: string;
}

const sampleStats: StatRowItem[] = [
  {
    id: "revenue",
    label: "Revenue",
    value: "$48,294",
    delta: "+12.5%",
    tone: "positive",
    caption: "vs last month",
  },
  {
    id: "customers",
    label: "Active customers",
    value: "2,318",
    delta: "+4.1%",
    tone: "positive",
    caption: "vs last month",
  },
  {
    id: "churn",
    label: "Churn rate",
    value: "1.9%",
    delta: "−0.4 pts",
    tone: "positive",
    caption: "vs last month",
  },
  {
    id: "order-value",
    label: "Average order",
    value: "$86.40",
    delta: "−2.4%",
    tone: "negative",
    caption: "vs last month",
  },
];

const toneBadge: Record<StatRowTone, BadgeVariant> = {
  positive: "success",
  negative: "error",
  neutral: "neutral",
};

const placeholders = ["first", "second", "third", "fourth"];

export interface StatRowProps {
  stats?: StatRowItem[];
  heading?: string;
  description?: string;
  actionLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function StatRow({
  stats = sampleStats,
  heading = "Overview",
  description = "The last 30 days, compared with the 30 before.",
  actionLabel = "View report",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: StatRowProps) {
  const showStats = !error && !loading && stats.length > 0;

  return (
    <section className="@container moderno-block-stat-row text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-3 @sm:flex @sm:items-end @sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
            {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
          </div>
          {actionLabel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              disabled={disabled || !showStats}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                The numbers are safe; only this view failed to load.
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
        ) : null}

        {!error && loading ? (
          <div
            role="status"
            aria-busy="true"
            className="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-4"
          >
            <span className="sr-only">Loading stats…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} size="sm">
                <Card.Content className="gap-2">
                  <Skeleton shape="text" className="w-1/2" />
                  <Skeleton shape="text" className="h-8 w-3/4 @md:h-10" />
                  <Skeleton shape="text" className="w-2/3" />
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        ) : null}

        {!error && !loading && stats.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>No numbers yet</Card.Title>
              <Card.Description>
                Stats appear here once there is activity in this period.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showStats ? (
          <ul className="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-4">
            {stats.map((stat) => (
              <li key={stat.id} className="flex">
                <Card.Root size="sm">
                  <Card.Content className="gap-2">
                    <p className="text-ui-md text-muted-foreground">{stat.label}</p>
                    <p className="font-serif text-heading tabular-nums @md:text-heading-lg">
                      {stat.value}
                    </p>
                    {stat.delta ? (
                      <p className="flex flex-wrap items-center gap-2">
                        <Badge variant={toneBadge[stat.tone ?? "neutral"]} size="sm">
                          {stat.delta}
                        </Badge>
                        {stat.caption ? (
                          <span className="text-ui-xs text-muted-foreground">{stat.caption}</span>
                        ) : null}
                      </p>
                    ) : null}
                  </Card.Content>
                </Card.Root>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
