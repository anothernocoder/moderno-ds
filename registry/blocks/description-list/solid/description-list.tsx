import { For, Show } from "solid-js";
import { Alert, Badge, Button, Card, Divider, Skeleton } from "@moderno-ui/solid";

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

export function DescriptionList(props: DescriptionListProps) {
  const items = () => props.items ?? sampleItems;
  const heading = () => props.heading ?? "Customer details";
  const description = () => props.description ?? "Contact and billing details for this account.";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const showList = () => !props.error && !props.loading && items().length > 0;

  return (
    <section class="@container moderno-block-description-list text-foreground">
      <div class="grid gap-4">
        <div class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
          <Show when={description()}>
            <p class="text-ui-md text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <Divider />

        <Show when={props.error}>
          {(message) => (
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{message()}</Alert.Title>
                <Alert.Description>
                  Nothing was changed. The details are still saved.
                </Alert.Description>
                <Alert.Action>
                  <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
                    Try again
                  </Button>
                </Alert.Action>
              </Alert.Content>
            </Alert.Root>
          )}
        </Show>

        <Show when={props.loading}>
          <div role="status" aria-busy="true" class="grid">
            <For each={placeholders}>
              {() => (
                <div
                  aria-hidden="true"
                  class="grid gap-2 py-3 first:pt-0 @md:grid-cols-3 @md:gap-4 @lg:grid-cols-4"
                >
                  <Skeleton shape="text" class="w-1/3 @md:w-2/3" />
                  <Skeleton shape="text" class="w-2/3 @md:col-span-2 @lg:col-span-3" />
                </div>
              )}
            </For>
            <span class="sr-only">Loading details…</span>
          </div>
        </Show>

        <Show when={!props.error && !props.loading && items().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>No details yet</Card.Title>
              <Card.Description>Details added to this record show up here.</Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={showList()}>
          <dl class="divide-y divide-border">
            <For each={items()}>
              {(item) => (
                <div class="grid gap-1 py-3 first:pt-0 @md:grid-cols-3 @md:items-baseline @md:gap-4 @lg:grid-cols-4">
                  <dt class="text-ui-md text-muted-foreground">{item.term}</dt>
                  <dd class="grid justify-items-start gap-2 text-ui-md @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @md:col-span-2 @lg:col-span-3">
                    <Show
                      when={item.badge}
                      fallback={<span class="min-w-0 break-words">{item.value}</span>}
                    >
                      {(variant) => (
                        <Badge variant={variant()} dot>
                          {item.value}
                        </Badge>
                      )}
                    </Show>
                    <Show when={item.action}>
                      {(label) => (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          class="-my-1 -ml-3 shrink-0 @sm:ml-0 @sm:-mr-3"
                          disabled={inert()}
                          aria-label={`${label()} ${item.term}`}
                          onClick={() => props.onAction?.(item.id)}
                        >
                          {label()}
                        </Button>
                      )}
                    </Show>
                  </dd>
                </div>
              )}
            </For>
          </dl>
        </Show>
      </div>
    </section>
  );
}
