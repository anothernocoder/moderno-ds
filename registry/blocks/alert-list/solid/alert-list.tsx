import { For, Show } from "solid-js";
import { Alert, Button, Card } from "@moderno-ui/solid";

export type AlertListVariant = "info" | "success" | "warning" | "error";

export interface AlertListItem {
  id: string;
  variant: AlertListVariant;
  title: string;
  description?: string;
  meta?: string;
  actionLabel?: string;
}

const sampleAlerts: AlertListItem[] = [
  {
    id: "payment",
    variant: "error",
    title: "Payment failed",
    description: "We could not charge the card ending 4242. Billing retries in two days.",
    meta: "2 min ago",
    actionLabel: "Update card",
  },
  {
    id: "storage",
    variant: "warning",
    title: "Storage almost full",
    description: "The workspace is using 92% of its plan's storage.",
    meta: "1 hr ago",
    actionLabel: "Manage storage",
  },
  {
    id: "sign-in",
    variant: "info",
    title: "New sign-in from Lisbon",
    description: "Chrome on macOS. Not you? End the session and change your password.",
    meta: "3 hrs ago",
    actionLabel: "Review session",
  },
  {
    id: "backup",
    variant: "success",
    title: "Backup finished",
    description: "Last night's backup completed in four minutes.",
    meta: "Yesterday",
  },
];

const statusPath: Record<AlertListVariant, string> = {
  info: "M12 16v-4M12 8h.01",
  success: "m8 12 2.5 2.5L16 9",
  warning: "M12 8v4M12 16h.01",
  error: "m15 9-6 6M9 9l6 6",
};

function StatusIcon(props: { variant: AlertListVariant }) {
  return (
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d={statusPath[props.variant]} />
    </svg>
  );
}

function DismissIcon() {
  return (
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export interface AlertListProps {
  alerts?: AlertListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  onAction?: (id: string) => void;
  onRetry?: () => void;
}

export function AlertList(props: AlertListProps) {
  const alerts = () => props.alerts ?? sampleAlerts;
  const heading = () => props.heading ?? "Notifications";
  const description = () =>
    props.description ?? "What happened in your workspace while you were away.";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const showList = () => !props.error && !props.loading && alerts().length > 0;

  return (
    <section class="@container moderno-block-alert-list text-foreground">
      <div class="grid gap-4">
        <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div class="grid gap-1">
            <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
            <Show when={description()}>
              <p class="text-ui-md text-muted-foreground">{description()}</p>
            </Show>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={inert() || !showList()}
            aria-busy={props.loading}
            onClick={props.onDismissAll}
          >
            <Show when={props.loading} fallback="Dismiss all">
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              Refreshing
            </Show>
          </Button>
        </div>

        <Show when={props.error}>
          {(message) => (
            <Alert.Root variant="error">
              <Alert.Icon>
                <StatusIcon variant="error" />
              </Alert.Icon>
              <Alert.Content>
                <Alert.Title>{message()}</Alert.Title>
                <Alert.Description>
                  Nothing was dismissed. Your notifications are still on the server.
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
          <Card.Root>
            <Card.Content
              class="items-center justify-center text-center"
              role="status"
              aria-busy="true"
            >
              <span
                aria-hidden="true"
                class="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              <p class="text-ui-md text-muted-foreground">Checking for new notifications…</p>
            </Card.Content>
          </Card.Root>
        </Show>

        <Show when={!props.error && !props.loading && alerts().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>You are all caught up</Card.Title>
              <Card.Description>
                New alerts about billing, security and your workspace appear here.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={showList()}>
          <ul class="grid gap-3">
            <For each={alerts()}>
              {(item) => (
                <li>
                  <Alert.Root variant={item.variant} size="sm">
                    <Alert.Icon>
                      <StatusIcon variant={item.variant} />
                    </Alert.Icon>
                    <Alert.Content>
                      <div class="flex items-start justify-between gap-2">
                        <div class="grid min-w-0 flex-1 gap-1 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
                          <Alert.Title>{item.title}</Alert.Title>
                          <Show when={item.meta}>
                            <Alert.Description class="hidden text-ui-xs @sm:block">
                              {item.meta}
                            </Alert.Description>
                          </Show>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          class="shrink-0"
                          disabled={inert()}
                          aria-label={`Dismiss — ${item.title}`}
                          onClick={() => props.onDismiss?.(item.id)}
                        >
                          <DismissIcon />
                          <span class="hidden @md:inline">Dismiss</span>
                        </Button>
                      </div>
                      <Show when={item.description}>
                        <Alert.Description class="line-clamp-2 @md:line-clamp-none">
                          {item.description}
                        </Alert.Description>
                      </Show>
                      <Show when={item.actionLabel}>
                        <Alert.Action>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={inert()}
                            onClick={() => props.onAction?.(item.id)}
                          >
                            {item.actionLabel}
                          </Button>
                        </Alert.Action>
                      </Show>
                    </Alert.Content>
                  </Alert.Root>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </section>
  );
}
