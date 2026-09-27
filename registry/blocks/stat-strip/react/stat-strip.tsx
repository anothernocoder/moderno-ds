import { Alert, Button, Skeleton } from "@moderno-ui/react";

export interface StatStripStat {
  id: string;
  value: string;
  label: string;
}

const sampleStats: StatStripStat[] = [
  { id: "invoiced", value: "$2.4B", label: "Invoiced by our customers" },
  { id: "teams", value: "12,000+", label: "Finance teams on board" },
  { id: "close", value: "3 days", label: "Saved on every month-end close" },
  { id: "uptime", value: "99.99%", label: "Uptime over the last year" },
];

const placeholders = ["first", "second", "third", "fourth"];

export interface StatStripProps {
  heading?: string;
  description?: string;
  actionLabel?: string;
  stats?: StatStripStat[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function StatStrip({
  heading = "The numbers behind a calmer close",
  description = "Finance teams of every size run their books on one workspace.",
  actionLabel = "Read the customer report",
  stats = sampleStats,
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: StatStripProps) {
  return (
    <section className="@container moderno-block-stat-strip text-foreground">
      <div className="mx-auto grid w-full max-w-lg gap-8 px-4 py-12 @lg:py-16">
        <div className="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div className="grid max-w-md gap-2">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? (
              <p className="text-body text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actionLabel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start @sm:shrink-0"
              disabled={disabled}
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
                The rest of the page still works. Try again in a moment.
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
            className="grid grid-cols-2 gap-x-6 gap-y-8 @lg:grid-cols-4"
          >
            <span className="sr-only">Loading stats…</span>
            {placeholders.map((key) => (
              <div key={key} aria-hidden="true" className="grid gap-2 border-t border-border pt-4">
                <Skeleton shape="text" className="h-8 w-2/3 @md:h-10" />
                <Skeleton shape="text" className="w-3/4" />
              </div>
            ))}
          </div>
        ) : stats.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No numbers to show yet.
          </p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 @lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="grid content-start gap-1 border-t border-border pt-4">
                <dt className="row-start-2 text-ui-sm text-pretty text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="row-start-1 font-serif text-heading tabular-nums @md:text-heading-lg">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
