<script setup lang="ts">
import { computed, ref } from "vue";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/vue";

const errorPaths = [
  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
  "M12 9v4",
  "M12 17h.01",
];

const props = withDefaults(
  defineProps<{
    badge?: string;
    title?: string;
    message?: string;
    actionLabel?: string;
    dismissible?: boolean;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    badge: "New",
    title: "Bank sync is live",
    message: "Connect your accounts and watch every transaction match its receipt.",
    actionLabel: "See how it works",
    dismissible: true,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  dismiss: [];
  retry: [];
}>();

const dismissed = ref(false);

const showBanner = computed(
  () => !props.error && !props.loading && !dismissed.value && Boolean(props.title || props.message),
);

function dismiss() {
  dismissed.value = true;
  emit("dismiss");
}
</script>

<template>
  <div class="@container moderno-block-banner text-foreground">
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
          aria-hidden="true"
        >
          <path v-for="d in errorPaths" :key="d" :d="d" />
        </svg>
      </Alert.Icon>
      <Alert.Content>
        <Alert.Title>{{ error }}</Alert.Title>
        <Alert.Description>The announcement shows here once it loads.</Alert.Description>
        <Alert.Action>
          <Button
            type="button"
            variant="outline"
            size="sm"
            :disabled="disabled"
            @click="emit('retry')"
          >
            Try again
          </Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>

    <div v-if="loading" role="status" aria-busy="true">
      <div
        aria-hidden="true"
        class="flex items-center gap-3 border-b border-border bg-muted px-4 py-3"
      >
        <Skeleton shape="rect" class="h-5 w-12 shrink-0" />
        <Skeleton shape="text" class="w-2/3" />
        <Skeleton shape="rect" class="ms-auto h-8 w-24 shrink-0" />
      </div>
      <span class="sr-only">Loading the announcement…</span>
    </div>

    <section
      v-if="showBanner"
      aria-label="Announcement"
      class="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
    >
      <span aria-hidden="true" class="hidden @lg:block @lg:flex-1" />
      <div
        class="grid min-w-0 flex-1 gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @lg:max-w-md @lg:flex-initial"
      >
        <p class="grid justify-items-start gap-1 text-body @md:block">
          <Badge v-if="badge" variant="outline" class="@md:me-2">{{ badge }}</Badge>
          <strong v-if="title" class="font-semibold">{{ title }}</strong>
          <span
            v-if="title && message"
            aria-hidden="true"
            class="hidden text-muted-foreground @md:mx-2 @md:inline"
            >·</span
          >
          <span v-if="message" class="text-muted-foreground">{{ message }}</span>
        </p>
        <Button
          v-if="actionLabel"
          type="button"
          size="sm"
          class="shrink-0 justify-self-start"
          :disabled="disabled"
          @click="emit('action')"
        >
          {{ actionLabel }}
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Button>
      </div>
      <div class="flex shrink-0 @lg:flex-1 @lg:justify-end">
        <Button
          v-if="dismissible"
          type="button"
          variant="ghost"
          size="sm"
          :disabled="disabled"
          aria-label="Dismiss announcement"
          @click="dismiss"
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
        </Button>
      </div>
    </section>
  </div>
</template>
