import { For, Show } from "solid-js";
import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/solid";

export type StackedListStatus = "neutral" | "info" | "success" | "warning" | "error";

export interface StackedListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  image?: string;
  status?: string;
  statusVariant?: StackedListStatus;
  meta?: string;
}

const sampleItems: StackedListItem[] = [
  {
    id: "leslie",
    title: "Leslie Alexander",
    subtitle: "leslie.alexander@example.com",
    initials: "LA",
    status: "Active",
    statusVariant: "success",
    meta: "Last seen 3 hrs ago",
  },
  {
    id: "michael",
    title: "Michael Foster",
    subtitle: "michael.foster@example.com",
    initials: "MF",
    status: "Invited",
    statusVariant: "info",
    meta: "Invited 2 days ago",
  },
  {
    id: "dries",
    title: "Dries Vincent",
    subtitle: "dries.vincent@example.com",
    initials: "DV",
    status: "Away",
    statusVariant: "warning",
    meta: "Last seen yesterday",
  },
  {
    id: "lindsay",
    title: "Lindsay Walton",
    subtitle: "lindsay.walton@example.com",
    initials: "LW",
    status: "Suspended",
    statusVariant: "error",
    meta: "Suspended last week",
  },
  {
    id: "courtney",
    title: "Courtney Henry",
    subtitle: "courtney.henry@example.com",
    initials: "CH",
    status: "Guest",
    statusVariant: "neutral",
    meta: "Last seen 2 weeks ago",
  },
];

const placeholders = ["first", "second", "third"];

export interface StackedListProps {
  items?: StackedListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onView?: (id: string) => void;
  onInvite?: () => void;
  onRetry?: () => void;
}

export function StackedList(props: StackedListProps) {
  const items = () => props.items ?? sampleItems;
  const heading = () => props.heading ?? "Team members";
  const description = () => props.description ?? "Everyone with access to this workspace.";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const showRows = () => !props.loading && items().length > 0;

  return (
    <section class="@container moderno-block-stacked-list text-foreground">
      <div class="grid gap-4">
        <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div class="grid gap-1">
            <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
            <Show when={description()}>
              <p class="text-ui-md text-muted-foreground">{description()}</p>
            </Show>
          </div>
          <Button type="button" size="sm" disabled={inert()} onClick={props.onInvite}>
            Invite member
          </Button>
        </div>

        <Show
          when={props.error}
          fallback={
            <Card.Root>
              <Card.Content class="gap-0 p-4 @sm:p-6">
                <Show when={props.loading}>
                  <div role="status" aria-busy="true" class="grid">
                    <For each={placeholders}>
                      {() => (
                        <div
                          aria-hidden="true"
                          class="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                        >
                          <Skeleton shape="circle" class="size-10 shrink-0" />
                          <div class="grid flex-1 gap-2">
                            <Skeleton shape="text" class="w-1/3" />
                            <Skeleton shape="text" class="w-2/3" />
                          </div>
                        </div>
                      )}
                    </For>
                    <span class="sr-only">Loading team members…</span>
                  </div>
                </Show>

                <Show when={!props.loading && items().length === 0}>
                  <div class="grid gap-1 py-4 text-center">
                    <p class="text-ui-md font-medium">No members yet</p>
                    <p class="text-ui-md text-muted-foreground">People you invite show up here.</p>
                  </div>
                </Show>

                <Show when={showRows()}>
                  <ul class="divide-y divide-border">
                    <For each={items()}>
                      {(item) => (
                        <li class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:gap-4">
                          <div class="flex w-full min-w-0 flex-1 items-start gap-3 @md:items-center">
                            <Avatar.Root>
                              <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                              <Show when={item.image}>
                                {(src) => <Avatar.Image src={src()} alt="" />}
                              </Show>
                            </Avatar.Root>
                            <div class="grid min-w-0 flex-1 gap-2 @md:flex @md:items-center @md:justify-between @md:gap-4">
                              <div class="grid min-w-0 gap-1">
                                <p class="truncate text-ui-md font-medium">{item.title}</p>
                                <Show when={item.subtitle}>
                                  <p class="truncate text-ui-md text-muted-foreground">
                                    {item.subtitle}
                                  </p>
                                </Show>
                              </div>
                              <Show when={item.status || item.meta}>
                                <div class="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-3">
                                  <Show when={item.status}>
                                    <Badge variant={item.statusVariant ?? "neutral"} dot>
                                      {item.status}
                                    </Badge>
                                  </Show>
                                  <Show when={item.meta}>
                                    <span class="text-ui-sm text-muted-foreground">
                                      {item.meta}
                                    </span>
                                  </Show>
                                </div>
                              </Show>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="shrink-0"
                            disabled={inert()}
                            aria-label={`View ${item.title}`}
                            onClick={() => props.onView?.(item.id)}
                          >
                            View
                          </Button>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </Card.Content>
            </Card.Root>
          }
        >
          {(message) => (
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{message()}</Alert.Title>
                <Alert.Description>
                  Nothing was changed. Your team is still saved.
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
      </div>
    </section>
  );
}
