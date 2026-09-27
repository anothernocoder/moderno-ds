import { Alert, Badge, Button, Card, Divider, Skeleton } from "@moderno-ui/react";

export type DescriptionListBadge = "neutral" | "info" | "success" | "warning" | "error";

export interface DescriptionListItem {
  id: string;
  term: string;
  value: string;
  badge?: DescriptionListBadge;
  action?: string;
}

const sampleItems: DescriptionListItem[] = [
  { id: "name", term: "Full name", value: "Margot Foster", action: "Change" },
  { id: "email", term: "Email", value: "margot.foster@example.com", action: "Change" },
  { id: "company", term: "Company", value: "Northwind Labs" },
  { id: "plan", term: "Plan", value: "Pro, billed yearly", action: "Change" },
  { id: "status", term: "Status", value: "Active", badge: "success" },
  { id: "since", term: "Customer since", value: "March 12, 2024" },
  {
    id: "notes",
    term: "Notes",
    value:
      "Prefers invoices in euros and a call before any plan change. Renewals go through the finance team.",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

export interface DescriptionListProps {
  items?: DescriptionListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: (id: string) => void;
  onRetry?: () => void;
}

export function DescriptionList({
  items = sampleItems,
  heading = "Customer details",
  description = "Contact and billing details for this account.",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: DescriptionListProps) {
  const inert = loading || disabled;
  const showList = !error && !loading && items.length > 0;

  return (
    <section className="@container moderno-block-description-list text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
          {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
        </div>

        <Divider />

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                Nothing was changed. The details are still saved.
              </Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        {loading ? (
          <div role="status" aria-busy="true" className="grid">
            {placeholders.map((key) => (
              <div
                key={key}
                aria-hidden="true"
                className="grid gap-2 py-3 first:pt-0 @md:grid-cols-3 @md:gap-4 @lg:grid-cols-4"
              >
                <Skeleton shape="text" className="w-1/3 @md:w-2/3" />
                <Skeleton shape="text" className="w-2/3 @md:col-span-2 @lg:col-span-3" />
              </div>
            ))}
            <span className="sr-only">Loading details…</span>
          </div>
        ) : null}

        {!error && !loading && items.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>No details yet</Card.Title>
              <Card.Description>Details added to this record show up here.</Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showList ? (
          <dl className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-1 py-3 first:pt-0 @md:grid-cols-3 @md:items-baseline @md:gap-4 @lg:grid-cols-4"
              >
                <dt className="text-ui-md text-muted-foreground">{item.term}</dt>
                <dd className="grid justify-items-start gap-2 text-ui-md @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @md:col-span-2 @lg:col-span-3">
                  {item.badge ? (
                    <Badge variant={item.badge} dot>
                      {item.value}
                    </Badge>
                  ) : (
                    <span className="min-w-0 break-words">{item.value}</span>
                  )}
                  {item.action ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="-my-1 -ml-3 shrink-0 @sm:ml-0 @sm:-mr-3"
                      disabled={inert}
                      aria-label={`${item.action} ${item.term}`}
                      onClick={() => onAction?.(item.id)}
                    >
                      {item.action}
                    </Button>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
