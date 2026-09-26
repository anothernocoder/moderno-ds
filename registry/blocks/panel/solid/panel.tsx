import { For, Show } from "solid-js";
import { Alert, Button, Card, Skeleton } from "@moderno-ui/solid";

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

export function Panel(props: PanelProps) {
  const panels = () => props.panels ?? samplePanels;
  const heading = () => props.heading ?? "Account settings";
  const description = () =>
    props.description ?? "Related options, grouped so each one is easy to find.";

  return (
    <section class="@container moderno-block-panel text-foreground">
      <div class="grid gap-4 @lg:gap-6">
        <div class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
          <Show when={description()}>
            <p class="text-ui-md text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <Show when={props.error}>
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{props.error}</Alert.Title>
              <Alert.Description>
                Your settings are safe; only this view failed to load.
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
          <div role="status" aria-busy="true" class="grid gap-3 @md:grid-cols-2 @lg:gap-4">
            <span class="sr-only">Loading settings…</span>
            <For each={placeholders}>
              {() => (
                <Card.Root aria-hidden="true">
                  <Card.Header class="gap-2">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="text" />
                    <Skeleton shape="text" class="w-2/3" />
                  </Card.Header>
                  <Card.Footer>
                    <Skeleton shape="rect" class="h-8 w-full @sm:w-32" />
                  </Card.Footer>
                </Card.Root>
              )}
            </For>
          </div>
        </Show>

        <Show when={!props.error && !props.loading && panels().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>Nothing to set up yet</Card.Title>
              <Card.Description>
                Settings appear here once there is something to change.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={!props.error && !props.loading && panels().length > 0}>
          <ul class="grid gap-3 @md:grid-cols-2 @lg:gap-4">
            <For each={panels()}>
              {(panel) => (
                <li class="flex">
                  <Card.Root>
                    <Card.Header>
                      <Card.Title>{panel.title}</Card.Title>
                      <Card.Description>{panel.description}</Card.Description>
                    </Card.Header>
                    <Show when={panel.actionLabel}>
                      <Card.Footer class="mt-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          class="w-full @sm:w-auto"
                          disabled={props.disabled}
                          onClick={() => props.onAction?.(panel.id)}
                        >
                          {panel.actionLabel}
                        </Button>
                      </Card.Footer>
                    </Show>
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
