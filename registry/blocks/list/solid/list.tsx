import { For, Show } from "solid-js";
import { Alert, Avatar, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/solid";

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  avatarUrl?: string;
  status?: string;
  statusVariant?: BadgeVariant;
  meta?: string;
}

const sampleItems: ListItem[] = [
  {
    id: "ana-lopez",
    title: "Ana López",
    subtitle: "ana.lopez@example.com",
    initials: "AL",
    status: "Active",
    statusVariant: "success",
    meta: "Online now",
  },
  {
    id: "ben-okafor",
    title: "Ben Okafor",
    subtitle: "ben.okafor@example.com",
    initials: "BO",
    status: "Invited",
    statusVariant: "info",
    meta: "Sent 2 days ago",
  },
  {
    id: "chen-wei",
    title: "Chen Wei",
    subtitle: "chen.wei@example.com",
    initials: "CW",
    status: "Active",
    statusVariant: "success",
    meta: "Seen 3 hrs ago",
  },
  {
    id: "dara-singh",
    title: "Dara Singh",
    subtitle: "dara.singh@example.com",
    initials: "DS",
    status: "Away",
    statusVariant: "warning",
    meta: "Back on Monday",
  },
  {
    id: "eli-moreau",
    title: "Eli Moreau",
    subtitle: "eli.moreau@example.com",
    initials: "EM",
    status: "Suspended",
    statusVariant: "error",
    meta: "Since last week",
  },
];

const placeholders = ["first", "second", "third"];

export interface ListProps {
  items?: ListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onInvite?: () => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  onRetry?: () => void;
}

export function List(props: ListProps) {
  const items = () => props.items ?? sampleItems;
  const heading = () => props.heading ?? "Team members";
  const description = () => props.description ?? "People who can open and edit this workspace.";
  const inert = () => Boolean(props.loading || props.disabled);
  const showRows = () => !props.error && !props.loading && items().length > 0;

  return (
    <section class="@container moderno-block-list text-foreground">
      <div class="grid gap-4">
        <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div class="grid gap-1">
            <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading()}</h2>
            <Show when={description()}>
              <p class="text-ui-md text-muted-foreground">{description()}</p>
            </Show>
          </div>
          <Button type="button" size="sm" disabled={inert()} onClick={() => props.onInvite?.()}>
            Invite member
          </Button>
        </div>

        <Show when={props.error}>
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{props.error}</Alert.Title>
              <Alert.Description>
                Nothing was changed. Your team is still in place.
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
          <Card.Root size="sm">
            <div role="status" aria-busy="true">
              <span class="sr-only">Loading team members…</span>
              <div class="divide-y divide-border" aria-hidden="true">
                <For each={placeholders}>
                  {() => (
                    <div class="flex items-center gap-3 px-4 py-3">
                      <Skeleton shape="circle" />
                      <div class="grid flex-1 gap-2">
                        <Skeleton shape="text" class="w-1/2" />
                        <Skeleton shape="text" class="w-3/4" />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Card.Root>
        </Show>

        <Show when={!props.error && !props.loading && items().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>No members yet</Card.Title>
              <Card.Description>People you invite show up here, one row each.</Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={showRows()}>
          <Card.Root size="sm">
            <ul class="divide-y divide-border">
              <For each={items()}>
                {(item) => (
                  <li class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 @sm:grid-cols-[auto_minmax(0,1fr)_auto] @md:grid-cols-[auto_minmax(0,1fr)_auto_auto] @md:gap-x-4">
                    <Avatar.Root>
                      <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                      <Show when={item.avatarUrl}>
                        <Avatar.Image src={item.avatarUrl} alt="" />
                      </Show>
                    </Avatar.Root>
                    <div class="grid min-w-0 gap-0.5">
                      <p class="truncate text-ui-md font-medium">{item.title}</p>
                      <Show when={item.subtitle}>
                        <p class="truncate text-ui-sm text-muted-foreground">{item.subtitle}</p>
                      </Show>
                    </div>
                    <Show when={item.status || item.meta}>
                      <div class="col-start-2 flex flex-wrap items-center gap-2 @md:col-start-3 @md:row-start-1 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-4">
                        <Show when={item.status}>
                          <Badge variant={item.statusVariant ?? "neutral"} size="sm" dot>
                            {item.status}
                          </Badge>
                        </Show>
                        <Show when={item.meta}>
                          <span class="text-ui-xs text-muted-foreground @lg:w-28 @lg:text-right">
                            {item.meta}
                          </span>
                        </Show>
                      </div>
                    </Show>
                    <div
                      class={
                        item.status || item.meta
                          ? "col-start-2 flex gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @md:col-start-4 @md:row-span-1"
                          : "col-start-2 flex gap-2 @sm:col-start-3 @sm:row-start-1 @md:col-start-4"
                      }
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={props.disabled}
                        aria-label={`Edit ${item.title}`}
                        onClick={() => props.onEdit?.(item.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={props.disabled}
                        aria-label={`Remove ${item.title}`}
                        onClick={() => props.onRemove?.(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Card.Root>
        </Show>
      </div>
    </section>
  );
}
