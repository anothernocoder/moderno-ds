<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Card } from "@moderno-ui/vue";

type AlertListVariant = "info" | "success" | "warning" | "error";

interface AlertListItem {
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

const statusPath: Record<AlertListVariant, string> = {
  info: "M12 16v-4M12 8h.01",
  success: "m8 12 2.5 2.5L16 9",
  warning: "M12 8v4M12 16h.01",
  error: "m15 9-6 6M9 9l6 6",
};

const props = withDefaults(
  defineProps<{
    alerts?: AlertListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    alerts: undefined,
    heading: "Notifications",
    description: "What happened in your workspace while you were away.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  dismiss: [id: string];
  dismissAll: [];
  action: [id: string];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedAlerts = computed(() => props.alerts ?? sampleAlerts);

const inert = computed(() => props.loading || props.disabled);
const showList = computed(() => !props.error && !props.loading && resolvedAlerts.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-alert-list text-foreground">
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
          <p class="text-ui-md text-muted-foreground">Checking for new notifications…</p>
        </Card.Content>
      </Card.Root>

      <Card.Root v-if="!error && !loading && resolvedAlerts.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>You are all caught up</Card.Title>
          <Card.Description>
            New alerts about billing, security and your workspace appear here.
          </Card.Description>
        </Card.Header>
      </Card.Root>

      <ul v-if="showList" class="grid gap-3">
        <li v-for="item in resolvedAlerts" :key="item.id">
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
                <Alert.Description v-if="item.meta" class="text-ui-xs">{{
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
