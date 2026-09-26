<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Skeleton } from "@moderno-ui/vue";

type AppBannerKind = "impersonation" | "trial" | "incident";

interface AppBannerItem {
  id: string;
  kind: AppBannerKind;
  title: string;
  description?: string;
  actionLabel?: string;
  dismissible?: boolean;
}

const sampleBanners: AppBannerItem[] = [
  {
    id: "impersonation",
    kind: "impersonation",
    title: "Viewing as Jane Cooper",
    description: "You see what jane@acme.com sees. Every change you make is logged.",
    actionLabel: "Stop impersonating",
  },
  {
    id: "trial",
    kind: "trial",
    title: "12 days left in your trial",
    description: "Upgrade before 8 October to keep your projects and their history.",
    actionLabel: "Upgrade",
    dismissible: true,
  },
  {
    id: "incident",
    kind: "incident",
    title: "Degraded API performance",
    description: "Some requests take longer than usual. We are working on a fix.",
    actionLabel: "View status",
    dismissible: true,
  },
];

const kindVariant: Record<AppBannerKind, "warning" | "info" | "error"> = {
  impersonation: "warning",
  trial: "info",
  incident: "error",
};

const kindAction: Record<AppBannerKind, "primary" | "outline"> = {
  impersonation: "outline",
  trial: "primary",
  incident: "outline",
};

const kindIcon: Record<AppBannerKind, string[]> = {
  impersonation: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0"],
  trial: ["M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0", "M12 6v6l4 2"],
  incident: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
};

const props = withDefaults(
  defineProps<{
    banners?: AppBannerItem[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    banners: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [id: string];
  dismiss: [id: string];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedBanners = computed(() => props.banners ?? sampleBanners);

const showBanners = computed(
  () => !props.error && !props.loading && resolvedBanners.value.length > 0,
);
</script>

<template>
  <div class="@container moderno-block-app-banner text-foreground">
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
          <path v-for="d in kindIcon.incident" :key="d" :d="d" />
        </svg>
      </Alert.Icon>
      <Alert.Content>
        <Alert.Title>{{ error }}</Alert.Title>
        <Alert.Description
          >Announcements for your workspace show here once they load.</Alert.Description
        >
        <Alert.Action>
          <Button type="button" variant="outline" size="sm" @click="emit('retry')">
            Try again
          </Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>

    <div v-if="loading" role="status" aria-busy="true">
      <div
        aria-hidden="true"
        class="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
      >
        <Skeleton shape="circle" class="size-5 shrink-0" />
        <div class="grid flex-1 gap-2">
          <Skeleton shape="text" class="w-1/3" />
          <Skeleton shape="text" class="w-2/3" />
        </div>
        <Skeleton shape="rect" class="h-8 w-20 shrink-0" />
      </div>
      <span class="sr-only">Loading announcements…</span>
    </div>

    <ul v-if="showBanners" class="grid gap-2">
      <li v-for="banner in resolvedBanners" :key="banner.id">
        <Alert.Root :variant="kindVariant[banner.kind]">
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
              <path v-for="d in kindIcon[banner.kind]" :key="d" :d="d" />
            </svg>
          </Alert.Icon>
          <Alert.Content>
            <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
              <div class="grid min-w-0 gap-1 @md:block">
                <Alert.Title class="@md:inline">{{ banner.title }}</Alert.Title>
                <Alert.Description v-if="banner.description" class="@md:ms-2 @md:inline">{{
                  banner.description
                }}</Alert.Description>
              </div>
              <div
                v-if="banner.actionLabel || banner.dismissible"
                class="flex shrink-0 items-center gap-2"
              >
                <Button
                  v-if="banner.actionLabel"
                  type="button"
                  :variant="kindAction[banner.kind]"
                  size="sm"
                  :disabled="disabled"
                  @click="emit('action', banner.id)"
                >
                  {{ banner.actionLabel }}
                </Button>
                <Button
                  v-if="banner.dismissible"
                  type="button"
                  variant="ghost"
                  size="sm"
                  :disabled="disabled"
                  :aria-label="`Dismiss — ${banner.title}`"
                  @click="emit('dismiss', banner.id)"
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
                  <span class="hidden @lg:inline">Dismiss</span>
                </Button>
              </div>
            </div>
          </Alert.Content>
        </Alert.Root>
      </li>
    </ul>
  </div>
</template>
