import { Alert, Button, Card } from "@moderno-ui/react";

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

function StatusIcon({ variant }: { variant: AlertListVariant }) {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d={statusPath[variant]} />
    </svg>
  );
}

function DismissIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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

export function AlertList({
  alerts = sampleAlerts,
  heading = "Notifications",
  description = "What happened in your workspace while you were away.",
  error,
  loading = false,
  disabled = false,
  onDismiss,
  onDismissAll,
  onAction,
  onRetry,
}: AlertListProps) {
  const inert = loading || disabled;
  const showList = !error && !loading && alerts.length > 0;

  return (
    <section className="@container moderno-block-alert-list text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
            {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={inert || !showList}
            aria-busy={loading}
            onClick={onDismissAll}
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                Refreshing
              </>
            ) : (
              "Dismiss all"
            )}
          </Button>
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Icon>
              <StatusIcon variant="error" />
            </Alert.Icon>
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                Nothing was dismissed. Your notifications are still on the server.
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
          <Card.Root>
            <Card.Content
              className="items-center justify-center text-center"
              role="status"
              aria-busy="true"
            >
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              <p className="text-ui-md text-muted-foreground">Checking for new notifications…</p>
            </Card.Content>
          </Card.Root>
        ) : null}

        {!error && !loading && alerts.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>You are all caught up</Card.Title>
              <Card.Description>
                New alerts about billing, security and your workspace appear here.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showList ? (
          <ul className="grid gap-3">
            {alerts.map((item) => (
              <li key={item.id}>
                <Alert.Root variant={item.variant} size="sm">
                  <Alert.Icon>
                    <StatusIcon variant={item.variant} />
                  </Alert.Icon>
                  <Alert.Content>
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid min-w-0 flex-1 gap-1 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
                        <Alert.Title>{item.title}</Alert.Title>
                        {item.meta ? (
                          <Alert.Description className="hidden text-ui-xs @sm:block">
                            {item.meta}
                          </Alert.Description>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        disabled={inert}
                        aria-label={`Dismiss — ${item.title}`}
                        onClick={() => onDismiss?.(item.id)}
                      >
                        <DismissIcon />
                        <span className="hidden @md:inline">Dismiss</span>
                      </Button>
                    </div>
                    {item.description ? (
                      <Alert.Description className="line-clamp-2 @md:line-clamp-none">
                        {item.description}
                      </Alert.Description>
                    ) : null}
                    {item.actionLabel ? (
                      <Alert.Action>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={inert}
                          onClick={() => onAction?.(item.id)}
                        >
                          {item.actionLabel}
                        </Button>
                      </Alert.Action>
                    ) : null}
                  </Alert.Content>
                </Alert.Root>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
