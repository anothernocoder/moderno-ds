<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Button, Card, Skeleton } from "@moderno-ui/vue";

interface ActivityFeedActor {
  name: string;
  initials: string;
  avatarUrl?: string;
}

interface ActivityFeedEvent {
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

const props = withDefaults(
  defineProps<{
    events?: ActivityFeedEvent[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    events: undefined,
    heading: "Activity",
    description: "Recent changes across your workspace.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  viewAll: [];
  action: [id: string];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedEvents = computed(() => props.events ?? sampleEvents);

const inert = computed(() => props.loading || props.disabled);
const showList = computed(() => !props.error && !props.loading && resolvedEvents.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-activity-feed text-foreground">
    <div class="grid gap-4">
      <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
        <div class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
          <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          :disabled="inert || !showList"
          @click="emit('viewAll')"
        >
          View all
        </Button>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            Your activity is safe. Only this view failed to load.
          </Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>

      <div v-if="loading" class="grid gap-6" role="status" aria-busy="true">
        <span class="sr-only">Loading activity…</span>
        <div v-for="row in skeletonRows" :key="row" class="flex gap-3" aria-hidden="true">
          <Skeleton shape="circle" />
          <div class="grid flex-1 gap-2 pt-1">
            <div class="w-2/3"><Skeleton /></div>
            <div class="w-1/3"><Skeleton /></div>
          </div>
        </div>
      </div>

      <Card.Root v-if="!error && !loading && resolvedEvents.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>No activity yet</Card.Title>
          <Card.Description>
            Comments, uploads and finished work show up here as they happen.
          </Card.Description>
        </Card.Header>
      </Card.Root>

      <ol v-if="showList" class="grid">
        <li
          v-for="event in resolvedEvents"
          :key="event.id"
          class="group/event grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0 @md:grid-cols-[auto_minmax(0,1fr)_auto] @lg:grid-cols-[auto_auto_minmax(0,1fr)]"
        >
          <div
            class="relative col-start-1 row-start-1 row-end-5 flex justify-center @lg:col-start-2"
          >
            <Avatar.Root size="sm">
              <Avatar.Fallback>{{ event.actor.initials }}</Avatar.Fallback>
              <Avatar.Image
                v-if="event.actor.avatarUrl"
                :src="event.actor.avatarUrl"
                :alt="event.actor.name"
              />
            </Avatar.Root>
            <span
              aria-hidden="true"
              class="absolute top-10 -bottom-4 left-1/2 w-px -translate-x-1/2 bg-border group-last/event:hidden"
            />
          </div>
          <p class="col-start-2 row-start-1 pt-1.5 text-ui-md @lg:col-start-3">
            <span class="font-semibold">{{ event.actor.name }}</span>
            {{ event.action }}
            <span v-if="event.target" class="font-medium">{{ event.target }}</span>
          </p>
          <time
            :datetime="event.datetime"
            class="col-start-2 row-start-2 mt-1 text-ui-xs text-muted-foreground @md:col-start-3 @md:row-start-1 @md:mt-0 @md:pt-1.5 @md:leading-ui-md @lg:col-start-1 @lg:w-20 @lg:text-right"
            >{{ event.time }}</time
          >
          <blockquote
            v-if="event.comment"
            class="col-start-2 row-start-3 mt-2 rounded-lg border border-border bg-card px-3 py-2 text-ui-md text-card-foreground @md:col-end-4 @lg:col-start-3"
          >
            <p class="line-clamp-2 @sm:line-clamp-none">{{ event.comment }}</p>
          </blockquote>
          <div v-if="event.actionLabel" class="col-start-2 row-start-4 mt-2 @lg:col-start-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="inert"
              :aria-label="`${event.actionLabel} — ${eventSentence(event)}`"
              @click="emit('action', event.id)"
            >
              {{ event.actionLabel }}
            </Button>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
