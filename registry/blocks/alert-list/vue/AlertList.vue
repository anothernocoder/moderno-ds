<script setup lang="ts">
/**
 * AlertList — the notification centre: a stack of status alerts, newest first,
 * each dismissible on its own, under a heading that can clear the lot. Copy it
 * into your project with `moderno add alert-list-vue` and edit it freely: the
 * copy, the sample notifications and the order are yours from that moment, and
 * every visual comes from the token contract, so a theme re-skins it without a
 * diff here.
 *
 * Presentational: the block owns no notifications and removes nothing. It
 * renders the `alerts` it is handed and emits the id of whatever the reader
 * dismissed or acted on; you drop the item from your own state, which leaves an
 * optimistic removal and an undo yours to decide.
 *
 * Responsive to its container, not the viewport (ADR-0005) — the root declares
 * `@container` and makes one decision at each contract step: at `@sm`
 * (--container-sm) the header stops stacking and the heading shares a row with
 * "Dismiss all"; at `@md` (--container-md) each alert's dismiss control grows
 * its label; at `@lg` (--container-lg) each alert's timestamp leaves the stack
 * under its title and moves to the trailing edge on the title's baseline,
 * turning the list into a scannable timeline.
 *
 * States: default is the list; empty is its own render (the collection loaded
 * and there is nothing in it — pass `:alerts="[]"`); loading replaces the list
 * with a polite busy region rather than leaving stale rows under a spinner;
 * error means the list could not be loaded, so one Alert with a retry stands in
 * for it; disabled keeps the alerts on screen and makes every control inert.
 * Hover and focus-visible are the primitives' own rules.
 *
 * Each row keeps Alert's live-region role, so an alert appended to a mounted
 * list is announced while a list rendered with the page is not. Icons are
 * inline SVG stroking `currentColor`, not an icon package, so the block
 * installs without pulling an icon set into your dependencies.
 *
 * The timestamp is an `Alert.Description` too, sized down, rather than a muted
 * span of the block's own: secondary text on a status tint has to come from the
 * primitive, because the tint eats `--muted-foreground`'s AA margin and a block
 * may not invent a colour to make up the difference.
 * *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";
import { Alert, Button, Card } from "@moderno-ui/vue";

type AlertListVariant = "info" | "success" | "warning" | "error";

interface AlertListItem {
  /** Stable identity — what `dismiss` and `action` report back. */
  id: string;
  /** Which status the row speaks in; picks the tint, the glyph and the role. */
  variant: AlertListVariant;
  /** The one line a reader scans. */
  title: string;
  /** The sentence under it, when the title is not the whole story. */
  description?: string;
  /** When it happened, already phrased for a reader ("2 min ago"). */
  meta?: string;
  /** Label of the row's own action; omit for an alert that is only news. */
  actionLabel?: string;
}

/**
 * The sample feed. A block has to be something concrete, so this is a real
 * workspace's morning: one of each status, most urgent first. Delete it and
 * pass your own `alerts` — or rewrite it in place, the file is yours.
 */
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
    description: "Chrome on macOS. If this was not you, end the session and change your password.",
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

/** The glyph inside each status circle — the same four shapes the Alert docs use. */
const statusPath: Record<AlertListVariant, string> = {
  info: "M12 16v-4M12 8h.01",
  success: "m8 12 2.5 2.5L16 9",
  warning: "M12 8v4M12 16h.01",
  error: "m15 9-6 6M9 9l6 6",
};

const props = withDefaults(
  defineProps<{
    /** The notifications to render, newest first. `[]` renders the empty state. */
    alerts?: AlertListItem[];
    /** The list itself could not be loaded; this message replaces it. */
    error?: string;
    /** The list is being loaded or refreshed: a busy region stands in for it. */
    loading?: boolean;
    /** Read-only: the alerts stay on screen and every control is inert. */
    disabled?: boolean;
  }>(),
  { alerts: () => sampleAlerts, error: undefined, loading: false, disabled: false },
);

/**
 * `dismiss` and `action` carry the row's id; `dismissAll` clears the list and
 * `retry` re-runs the load that failed.
 */
const emit = defineEmits<{
  dismiss: [id: string];
  dismissAll: [];
  action: [id: string];
  retry: [];
}>();

const inert = computed(() => props.loading || props.disabled);
const showList = computed(() => !props.error && !props.loading && props.alerts.length > 0);
</script>

<template>
  <section class="@container moderno-block-alert-list text-foreground">
    <div class="grid gap-4">
      <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
        <div class="grid gap-1">
          <h2 class="text-lg font-semibold @md:text-xl">Notifications</h2>
          <p class="text-sm text-muted-foreground">
            What happened in your workspace while you were away.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          :disabled="inert || !showList"
          :aria-busy="loading"
          @click="emit('dismissAll')"
        >
          <template v-if="loading">
            <span
              aria-hidden="true"
              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            />
            Refreshing
          </template>
          <template v-else>Dismiss all</template>
        </Button>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Icon>
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
            <path :d="statusPath.error" />
          </svg>
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            Nothing was dismissed. Your notifications are still on the server.
          </Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>

      <Card.Root v-if="loading">
        <Card.Content
          class="items-center justify-center text-center"
          role="status"
          aria-busy="true"
        >
          <span
            aria-hidden="true"
            class="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          />
          <p class="text-sm text-muted-foreground">Checking for new notifications…</p>
        </Card.Content>
      </Card.Root>

      <Card.Root v-if="!error && !loading && alerts.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>You are all caught up</Card.Title>
          <Card.Description>
            New alerts about billing, security and your workspace appear here.
          </Card.Description>
        </Card.Header>
      </Card.Root>

      <ul v-if="showList" class="grid gap-3">
        <li v-for="item in alerts" :key="item.id">
          <Alert.Root :variant="item.variant" size="sm">
            <Alert.Icon>
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
                <path :d="statusPath[item.variant]" />
              </svg>
            </Alert.Icon>
            <Alert.Content>
              <div class="grid gap-1 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
                <Alert.Title>{{ item.title }}</Alert.Title>
                <Alert.Description v-if="item.meta" class="text-xs">{{
                  item.meta
                }}</Alert.Description>
              </div>
              <Alert.Description v-if="item.description">{{ item.description }}</Alert.Description>
              <Alert.Action v-if="item.actionLabel">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :disabled="inert"
                  @click="emit('action', item.id)"
                >
                  {{ item.actionLabel }}
                </Button>
              </Alert.Action>
            </Alert.Content>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="shrink-0"
              :disabled="inert"
              :aria-label="`Dismiss — ${item.title}`"
              @click="emit('dismiss', item.id)"
            >
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
              <span class="hidden @md:inline">Dismiss</span>
            </Button>
          </Alert.Root>
        </li>
      </ul>
    </div>
  </section>
</template>
