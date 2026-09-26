import { createUniqueId, For, Show } from "solid-js";
import { Alert, Button, Card, Skeleton, Switch } from "@moderno-ui/solid";

export type ActionPanelVariant = "default" | "destructive";

export interface ActionPanelItem {
  id: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
  action?: string;
}

const sampleItems: ActionPanelItem[] = [
  {
    id: "comments",
    title: "Comments",
    description: "Email me when someone comments on a document I own.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "Email me when a teammate mentions me.",
    defaultChecked: true,
  },
  {
    id: "digest",
    title: "Weekly digest",
    description: "A Monday summary of what changed in the workspace.",
  },
  {
    id: "export",
    title: "Export data",
    description: "Download every document and comment as one archive.",
    action: "Export",
  },
];

const placeholders = ["first", "second", "third"];

export interface ActionPanelProps {
  items?: ActionPanelItem[];
  heading?: string;
  description?: string;
  variant?: ActionPanelVariant;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onCheckedChange?: (id: string, checked: boolean) => void;
  onAction?: (id: string) => void;
  onRetry?: () => void;
}

export function ActionPanel(props: ActionPanelProps) {
  const uid = createUniqueId();
  const items = () => props.items ?? sampleItems;
  const heading = () => props.heading ?? "Workspace settings";
  const description = () => props.description ?? "Changes apply as soon as you make them.";
  const destructive = () => props.variant === "destructive";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const showRows = () => !props.error && !props.loading && items().length > 0;
  const descriptionId = (id: string) => `${uid}-${id}-description`;

  return (
    <section class="@container moderno-block-action-panel text-foreground">
      <div class="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
        <div class="grid content-start gap-1">
          <h2
            class={
              destructive()
                ? "text-body-lg font-semibold text-destructive @md:text-heading-sm"
                : "text-body-lg font-semibold @md:text-heading-sm"
            }
          >
            {heading()}
          </h2>
          <Show when={description()}>
            <p class="text-ui-md text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <Card.Root class={destructive() ? "border-destructive @lg:col-span-2" : "@lg:col-span-2"}>
          <Card.Content class="gap-0 p-4 @sm:p-6">
            <Show when={props.error}>
              {(message) => (
                <Alert.Root variant="error">
                  <Alert.Content>
                    <Alert.Title>{message()}</Alert.Title>
                    <Alert.Description>
                      Nothing was changed. Your settings are still saved.
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
                      class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                    >
                      <div class="grid w-full gap-2">
                        <Skeleton shape="text" class="w-1/3" />
                        <Skeleton shape="text" class="w-2/3" />
                      </div>
                      <Skeleton shape="rect" class="h-5 w-9 shrink-0" />
                    </div>
                  )}
                </For>
                <span class="sr-only">Loading settings…</span>
              </div>
            </Show>

            <Show when={!props.error && !props.loading && items().length === 0}>
              <div class="grid gap-1 py-4 text-center">
                <p class="text-ui-md font-medium">No settings yet</p>
                <p class="text-ui-md text-muted-foreground">
                  Settings added to this panel show up here.
                </p>
              </div>
            </Show>

            <Show when={showRows()}>
              <ul class="divide-y divide-border">
                <For each={items()}>
                  {(item) => (
                    <li class="py-4 first:pt-0 last:pb-0">
                      <Show
                        when={item.action}
                        fallback={
                          <Switch.Root
                            defaultChecked={item.defaultChecked}
                            disabled={inert()}
                            class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                            onCheckedChange={({ checked }) =>
                              props.onCheckedChange?.(item.id, checked)
                            }
                          >
                            <span class="grid gap-1">
                              <Switch.Label class="font-medium">{item.title}</Switch.Label>
                              <span
                                id={descriptionId(item.id)}
                                class="text-ui-md text-muted-foreground"
                              >
                                {item.description}
                              </span>
                            </span>
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                            <Switch.HiddenInput aria-describedby={descriptionId(item.id)} />
                          </Switch.Root>
                        }
                      >
                        {(label) => (
                          <div class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6">
                            <div class="grid gap-1">
                              <p class="text-ui-md font-medium">{item.title}</p>
                              <p
                                id={descriptionId(item.id)}
                                class="text-ui-md text-muted-foreground"
                              >
                                {item.description}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant={destructive() ? "destructive" : "outline"}
                              size="sm"
                              class="shrink-0"
                              disabled={inert()}
                              aria-describedby={descriptionId(item.id)}
                              onClick={() => props.onAction?.(item.id)}
                            >
                              {label()}
                            </Button>
                          </div>
                        )}
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Card.Content>
        </Card.Root>
      </div>
    </section>
  );
}
