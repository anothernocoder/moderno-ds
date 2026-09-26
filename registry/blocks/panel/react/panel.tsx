import { Alert, Button, Card, Skeleton } from "@moderno-ui/react";

export interface PanelItem {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
}

const samplePanels: PanelItem[] = [
  {
    id: "profile",
    title: "Profile",
    description: "Your name, photo and the bio other people see.",
    actionLabel: "Edit profile",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Which updates reach you by email and which stay in the app.",
    actionLabel: "Manage notifications",
  },
  {
    id: "billing",
    title: "Billing",
    description: "Your plan, your payment method and every past invoice.",
    actionLabel: "View billing",
  },
  {
    id: "security",
    title: "Security",
    description: "Two-step verification and the devices signed in to your account.",
    actionLabel: "Review security",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

export interface PanelProps {
  panels?: PanelItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: (id: string) => void;
  onRetry?: () => void;
}

export function Panel({
  panels = samplePanels,
  heading = "Account settings",
  description = "Related options, grouped so each one is easy to find.",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: PanelProps) {
  return (
    <section className="@container moderno-block-panel text-foreground">
      <div className="grid gap-4 @lg:gap-6">
        <div className="grid gap-1">
          <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
          {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                Your settings are safe; only this view failed to load.
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
          <div role="status" aria-busy="true" className="grid gap-3 @md:grid-cols-2 @lg:gap-4">
            <span className="sr-only">Loading settings…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} aria-hidden="true">
                <Card.Header className="gap-2">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="text" />
                  <Skeleton shape="text" className="w-2/3" />
                </Card.Header>
                <Card.Footer>
                  <Skeleton shape="rect" className="h-8 w-full @sm:w-32" />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        ) : null}

        {!error && !loading && panels.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>Nothing to set up yet</Card.Title>
              <Card.Description>
                Settings appear here once there is something to change.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {!error && !loading && panels.length > 0 ? (
          <ul className="grid gap-3 @md:grid-cols-2 @lg:gap-4">
            {panels.map((panel) => (
              <li key={panel.id} className="flex">
                <Card.Root>
                  <Card.Header>
                    <Card.Title>{panel.title}</Card.Title>
                    <Card.Description>{panel.description}</Card.Description>
                  </Card.Header>
                  {panel.actionLabel ? (
                    <Card.Footer className="mt-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full @sm:w-auto"
                        disabled={disabled}
                        onClick={() => onAction?.(panel.id)}
                      >
                        {panel.actionLabel}
                      </Button>
                    </Card.Footer>
                  ) : null}
                </Card.Root>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
