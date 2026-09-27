<script setup lang="ts">
import { computed, ref } from "vue";
import { Alert, Button, Skeleton } from "@moderno-ui/vue";

const errorPaths = [
  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
  "M12 9v4",
  "M12 17h.01",
];
const copyPaths = [
  "M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z",
  "M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2",
];
const copiedPaths = ["M20 6 9 17l-5-5"];

const props = withDefaults(
  defineProps<{
    offer?: string;
    detail?: string;
    code?: string;
    actionLabel?: string;
    dismissible?: boolean;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    offer: "20% off annual plans",
    detail: "Ends Sunday",
    code: "MONTHEND20",
    actionLabel: "Claim offer",
    dismissible: true,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  copy: [code: string];
  dismiss: [];
  retry: [];
}>();

const copied = ref(false);
const dismissed = ref(false);

const showPromo = computed(
  () => !props.error && !props.loading && !dismissed.value && Boolean(props.offer || props.detail),
);

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code);
  } catch {
    return;
  }
  copied.value = true;
  emit("copy", props.code);
}

function dismiss() {
  dismissed.value = true;
  emit("dismiss");
}
</script>

<template>
  <div class="@container moderno-block-promo text-foreground">
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
        <Alert.Description>The offer shows here once it loads.</Alert.Description>
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
        <Skeleton shape="text" class="w-1/2" />
        <Skeleton shape="rect" class="ms-auto h-8 w-24 shrink-0" />
        <Skeleton shape="rect" class="h-8 w-24 shrink-0" />
      </div>
      <span class="sr-only">Loading the offer…</span>
    </div>

    <section
      v-if="showPromo"
      aria-label="Promotion"
      class="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
    >
      <span aria-hidden="true" class="hidden @lg:block @lg:flex-1" />
      <div
        class="grid min-w-0 flex-1 gap-3 @md:flex @md:items-center @md:justify-between @md:gap-4 @lg:max-w-lg @lg:flex-initial"
      >
        <p class="grid gap-1 text-body @sm:block @md:grid @lg:block">
          <strong v-if="offer" class="font-semibold">{{ offer }}</strong>
          <span
            v-if="offer && detail"
            aria-hidden="true"
            class="hidden text-muted-foreground @sm:mx-2 @sm:inline @md:hidden @lg:inline"
            >·</span
          >
          <span v-if="detail" class="text-muted-foreground">{{ detail }}</span>
        </p>
        <div
          v-if="code || actionLabel"
          class="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-nowrap"
        >
          <Button
            v-if="code"
            type="button"
            variant="outline"
            size="sm"
            :disabled="disabled"
            :aria-label="`Copy code ${code}`"
            @click="copyCode"
          >
            <span class="font-mono">{{ code }}</span>
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
              <path v-for="d in copied ? copiedPaths : copyPaths" :key="d" :d="d" />
            </svg>
          </Button>
          <Button
            v-if="actionLabel"
            type="button"
            size="sm"
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
      </div>
      <div class="flex shrink-0 @lg:flex-1 @lg:justify-end">
        <Button
          v-if="dismissible"
          type="button"
          variant="ghost"
          size="sm"
          :disabled="disabled"
          aria-label="Dismiss promotion"
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
      <span role="status" class="sr-only">{{ copied ? "Code copied" : "" }}</span>
    </section>
  </div>
</template>
