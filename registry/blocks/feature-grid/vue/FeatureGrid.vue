<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Skeleton } from "@moderno-ui/vue";

type FeatureGridIcon = "zap" | "clock" | "receipt" | "chart" | "shield" | "users";

interface FeatureGridItem {
  id: string;
  icon: FeatureGridIcon;
  title: string;
  description: string;
}

const iconPaths: Record<FeatureGridIcon, string[]> = {
  zap: [
    "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z",
  ],
  clock: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", "M12 6v6l4 2"],
  receipt: [
    "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",
    "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",
    "M12 17.5v-11",
  ],
  chart: ["M3 3v16a2 2 0 0 0 2 2h16", "M18 17V9", "M13 17V5", "M8 17v-3"],
  shield: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z",
    "m9 12 2 2 4-4",
  ],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
};

const sampleFeatures: FeatureGridItem[] = [
  {
    id: "invoicing",
    icon: "zap",
    title: "Invoices in a minute",
    description: "Send a branded invoice from any device and see the moment it is opened.",
  },
  {
    id: "time",
    icon: "clock",
    title: "Time that bills itself",
    description: "Track hours as you work, then turn them into invoice lines in one step.",
  },
  {
    id: "receipts",
    icon: "receipt",
    title: "Receipts, matched",
    description: "Snap a receipt and it finds the transaction it belongs to on its own.",
  },
  {
    id: "reports",
    icon: "chart",
    title: "Reports that stay current",
    description: "Profit, spending and runway, updated every time money moves.",
  },
  {
    id: "security",
    icon: "shield",
    title: "Safe by default",
    description: "Encrypted at rest and in transit, with two-step sign-in for everyone.",
  },
  {
    id: "team",
    icon: "users",
    title: "Room for your team",
    description: "Invite your accountant and give each person only the access they need.",
  },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    features?: FeatureGridItem[];
    action?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "Everything you need to get paid",
    description:
      "One workspace for the money side of your business, from the first quote to the last receipt.",
    features: undefined,
    action: "See all features",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

const resolvedFeatures = computed(() => props.features ?? sampleFeatures);
const showFeatures = computed(
  () => !props.error && !props.loading && resolvedFeatures.value.length > 0,
);
</script>

<template>
  <section class="@container moderno-block-feature-grid text-foreground">
    <div class="grid gap-10 px-4 py-12 @lg:py-16">
      <div class="mx-auto grid max-w-md gap-3 text-center">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
        <p v-if="description" class="text-body text-muted-foreground">{{ description }}</p>
      </div>

      <Alert.Root v-if="error" variant="error" class="mx-auto w-full max-w-md">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            The rest of the page still works. Try again in a moment.
          </Alert.Description>
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
      <div
        v-else-if="loading"
        role="status"
        aria-busy="true"
        class="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-3"
      >
        <span class="sr-only">Loading features…</span>
        <div
          v-for="key in placeholders"
          :key="key"
          aria-hidden="true"
          class="grid content-start gap-3"
        >
          <Skeleton shape="rect" class="size-10" />
          <Skeleton shape="text" class="w-2/3" />
          <Skeleton shape="text" class="w-full" />
        </div>
      </div>
      <p
        v-else-if="resolvedFeatures.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No features to show yet.
      </p>
      <ul v-else class="grid gap-8 @sm:grid-cols-2 @lg:grid-cols-3">
        <li v-for="feature in resolvedFeatures" :key="feature.id" class="grid content-start gap-3">
          <div
            class="grid size-10 place-items-center rounded-lg border border-border bg-muted text-foreground"
          >
            <svg
              class="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-for="d in iconPaths[feature.icon]" :key="d" :d="d" />
            </svg>
          </div>
          <div class="grid gap-1">
            <h3 class="text-body font-semibold">{{ feature.title }}</h3>
            <p class="text-ui-md text-muted-foreground">{{ feature.description }}</p>
          </div>
        </li>
      </ul>

      <div v-if="showFeatures && action" class="flex justify-center">
        <Button type="button" variant="outline" :disabled="disabled" @click="emit('action')">
          {{ action }}
        </Button>
      </div>
    </div>
  </section>
</template>
