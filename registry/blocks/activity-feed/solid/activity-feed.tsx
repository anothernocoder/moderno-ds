import { For, Show } from "solid-js";
import { Alert, Avatar, Button, Card, Skeleton } from "@moderno-ui/solid";

export interface ActivityFeedActor {
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface ActivityFeedEvent {
  id: string;
  actor: ActivityFeedActor;
  action: string;
  target?: string;
  time: string;
  datetime?: string;
  comment?: string;
  actionLabel?: string;
}

const sampleEvents: ActivityFeedEvent[] = [
  {
    id: "comment",
    actor: { name: "Ada Lovelace", initials: "AL" },
    action: "commented on",
    target: "Q3 roadmap",
    time: "2 min ago",
    datetime: "2026-09-26T09:58",
    comment: "Can we move the pricing review before the launch checklist? Legal needs a full week.",
    actionLabel: "Reply",
  },
  {
    id: "done",
    actor: { name: "Grace Hopper", initials: "GH" },
    action: "completed",
    target: "Billing migration",
    time: "1 hr ago",
    datetime: "2026-09-26T09:00",
  },
  {
    id: "upload",
    actor: { name: "Katherine Johnson", initials: "KJ" },
    action: "uploaded",
    target: "launch-plan.pdf",
    time: "3 hrs ago",
    datetime: "2026-09-26T07:00",
    actionLabel: "Open",
  },
  {
    id: "join",
    actor: { name: "Alan Turing", initials: "AT" },
    action: "joined",
    target: "the Design team",
    time: "Yesterday",
    datetime: "2026-09-25",
  },
];

const skeletonRows = ["first", "second", "third"];

function eventSentence(event: ActivityFeedEvent): string {
  return [event.actor.name, event.action, event.target].filter(Boolean).join(" ");
}

export interface ActivityFeedProps {
  events?: ActivityFeedEvent[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onViewAll?: () => void;
  onAction?: (id: string) => void;
  onRetry?: () => void;
}

export function ActivityFeed(props: ActivityFeedProps) {
  const events = () => props.events ?? sampleEvents;
  const heading = () => props.heading ?? "Activity";
  const description = () => props.description ?? "Recent changes across your workspace.";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const showList = () => !props.error && !props.loading && events().length > 0;

  return (
    <section class="@container moderno-block-activity-feed text-foreground">
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
            onClick={props.onViewAll}
          >
            View all
          </Button>
        </div>

        <Show when={props.error}>
          {(message) => (
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{message()}</Alert.Title>
                <Alert.Description>
                  Your activity is safe. Only this view failed to load.
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
          <div class="grid gap-6" role="status" aria-busy="true">
            <span class="sr-only">Loading activity…</span>
            <For each={skeletonRows}>
              {() => (
                <div class="flex gap-3" aria-hidden="true">
                  <Skeleton shape="circle" />
                  <div class="grid flex-1 gap-2 pt-1">
                    <div class="w-2/3">
                      <Skeleton />
                    </div>
                    <div class="w-1/3">
                      <Skeleton />
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={!props.error && !props.loading && events().length === 0}>
          <Card.Root>
            <Card.Header class="items-center text-center">
              <Card.Title>No activity yet</Card.Title>
              <Card.Description>
                Comments, uploads and finished work show up here as they happen.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        </Show>

        <Show when={showList()}>
          <ol class="grid">
            <For each={events()}>
              {(event) => (
                <li class="group/event grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0 @md:grid-cols-[auto_minmax(0,1fr)_auto] @lg:grid-cols-[auto_auto_minmax(0,1fr)]">
                  <div class="relative col-start-1 row-start-1 row-end-5 flex justify-center @lg:col-start-2">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback>{event.actor.initials}</Avatar.Fallback>
                      <Show when={event.actor.avatarUrl}>
                        {(src) => <Avatar.Image src={src()} alt={event.actor.name} />}
                      </Show>
                    </Avatar.Root>
                    <span
                      aria-hidden="true"
                      class="absolute top-10 -bottom-4 left-1/2 w-px -translate-x-1/2 bg-border group-last/event:hidden"
                    />
                  </div>
                  <p class="col-start-2 row-start-1 pt-1.5 text-ui-md @lg:col-start-3">
                    <span class="font-semibold">{event.actor.name}</span> {event.action}
                    <Show when={event.target}>
                      <span class="font-medium"> {event.target}</span>
                    </Show>
                  </p>
                  <time
                    datetime={event.datetime}
                    class="col-start-2 row-start-2 mt-1 text-ui-xs text-muted-foreground @md:col-start-3 @md:row-start-1 @md:mt-0 @md:pt-1.5 @md:leading-ui-md @lg:col-start-1 @lg:w-20 @lg:text-right"
                  >
                    {event.time}
                  </time>
                  <Show when={event.comment}>
                    <blockquote class="col-start-2 row-start-3 mt-2 rounded-lg border border-border bg-card px-3 py-2 text-ui-md text-card-foreground @md:col-end-4 @lg:col-start-3">
                      <p class="line-clamp-2 @sm:line-clamp-none">{event.comment}</p>
                    </blockquote>
                  </Show>
                  <Show when={event.actionLabel}>
                    <div class="col-start-2 row-start-4 mt-2 @lg:col-start-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={inert()}
                        aria-label={`${event.actionLabel} — ${eventSentence(event)}`}
                        onClick={() => props.onAction?.(event.id)}
                      >
                        {event.actionLabel}
                      </Button>
                    </div>
                  </Show>
                </li>
              )}
            </For>
          </ol>
        </Show>
      </div>
    </section>
  );
}
