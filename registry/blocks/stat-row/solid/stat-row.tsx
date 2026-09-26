import { For, Show } from "solid-js";
import { Alert, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/solid";

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

export function StatRow(props: StatRowProps) {
  const stats = () => props.stats ?? sampleStats;
  const heading = () => props.heading ?? "Overview";
  const description = () => props.description ?? "The last 30 days, compared with the 30 before.";
  const actionLabel = () => props.actionLabel ?? "View report";
  const showStats = () => !props.error && !props.loading && stats().length > 0;

  return (
    <section class="@container moderno-block-stat-row text-foreground">
      <div class="grid gap-4">
        <div class="grid gap-3 @sm:flex @sm:items-end @sm:justify-between">
          <div class="grid gap-1">
            <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
            <Show when={description()}>
              <p class="text-ui-md text-muted-foreground">{description()}</p>
            </Show>
          </div>
          <Show when={actionLabel()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="justify-self-start"
              disabled={Boolean(props.disabled) || !showStats()}
              onClick={() => props.onAction?.()}
            >
              {actionLabel()}
            </Button>
          </Show>
        </div>

        <Show when={props.error}>
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{props.error}</Alert.Title>
              <Alert.Description>
                The numbers are safe; only this view failed to load.
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
        </Show>

        <Show when={!props.error && props.loading}>
          <div role="status" aria-busy="true" class="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-4">
            <span class="sr-only">Loading stats…</span>
            <For each={placeholders}>
              {() => (
                <Card.Root size="sm">
                  <Card.Content class="gap-2">
                    <Skeleton shape="text" class="w-1/2" />
                    <Skeleton shape="text" class="h-8 w-3/4 @md:h-10" />
                    <Skeleton shape="text" class="w-2/3" />
                  </Card.Content>
                </Card.Root>
              )}
            </For>
          </div>
        </Show>

        <Show when={!props.error && !props.loading && stats().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>No numbers yet</Card.Title>
              <Card.Description>
                Stats appear here once there is activity in this period.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={showStats()}>
          <ul class="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-4">
            <For each={stats()}>
              {(stat) => (
                <li class="flex">
                  <Card.Root size="sm">
                    <Card.Content class="gap-2">
                      <p class="text-ui-md text-muted-foreground">{stat.label}</p>
                      <p class="font-serif text-heading tabular-nums @md:text-heading-lg">
                        {stat.value}
                      </p>
                      <Show when={stat.delta}>
                        <p class="flex flex-wrap items-center gap-2">
                          <Badge variant={toneBadge[stat.tone ?? "neutral"]} size="sm">
                            {stat.delta}
                          </Badge>
                          <Show when={stat.caption}>
                            <span class="text-ui-xs text-muted-foreground">{stat.caption}</span>
                          </Show>
                        </p>
                      </Show>
                    </Card.Content>
                  </Card.Root>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
}
