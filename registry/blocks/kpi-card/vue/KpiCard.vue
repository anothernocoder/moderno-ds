<script setup lang="ts">
import { computed } from "vue";
import {
  Alert,
  Badge,
  Button,
  Card,
  Skeleton,
  SparkChart,
  type BadgeVariant,
} from "@moderno-ui/vue";

type KpiCardTone = "positive" | "negative" | "neutral";

interface KpiCardMetric {
  value: string;
  delta?: string;
  tone?: KpiCardTone;
  caption?: string;
  trend?: number[];
}

const sampleMetric: KpiCardMetric = {
  value: "$48,294",
  delta: "+12.5%",
  tone: "positive",
  caption: "vs last month",
  trend: [31, 34, 33, 38, 36, 41, 39, 44, 42, 47, 45, 48],
};

const toneBadge: Record<KpiCardTone, BadgeVariant> = {
  positive: "success",
  negative: "error",
  neutral: "neutral",
};

const props = withDefaults(
  defineProps<{
    label?: string;
    period?: string;
    metric?: KpiCardMetric | null;
    actionLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    label: "Revenue",
    period: "Last 30 days",
    metric: undefined,
    actionLabel: "View report",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedMetric = computed(() => (props.metric === undefined ? sampleMetric : props.metric));

const showMetric = computed(() => !props.error && !props.loading && resolvedMetric.value !== null);

const trendPoints = computed(() => (resolvedMetric.value?.trend ?? []).map((y, x) => ({ x, y })));
</script>

<template>
  <section class="@container moderno-block-kpi-card text-foreground">
    <Card.Root>
      <Card.Header class="flex-row items-start justify-between gap-3">
        <div class="grid min-w-0 gap-1">
          <Card.Title>{{ label }}</Card.Title>
          <Card.Description v-if="period">{{ period }}</Card.Description>
        </div>
        <Button
          v-if="actionLabel"
          type="button"
          variant="ghost"
          size="sm"
          class="shrink-0"
          :disabled="disabled || !showMetric"
          @click="emit('action')"
        >
          {{ actionLabel }}
        </Button>
      </Card.Header>

      <Card.Content>
        <Alert.Root v-if="error" variant="error">
          <Alert.Content>
            <Alert.Title>{{ error }}</Alert.Title>
            <Alert.Description
              >The number is safe; only this card failed to load.</Alert.Description
            >
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
          class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between"
        >
          <span class="sr-only">Loading {{ label }}…</span>
          <div class="grid gap-2 @sm:w-1/3">
            <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
            <Skeleton shape="text" class="w-full" />
          </div>
          <Skeleton
            shape="rect"
            class="h-12 w-full shrink-0 @sm:w-40 @md:h-14 @md:w-56 @lg:h-20 @lg:w-72"
          />
        </div>

        <div v-else-if="resolvedMetric === null" class="grid gap-1 py-4 text-center">
          <p class="text-body font-semibold">No data yet</p>
          <p class="text-ui-md text-muted-foreground">
            This number appears once there is activity in this period.
          </p>
        </div>

        <div v-else class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between">
          <div class="grid min-w-0 gap-2">
            <p class="font-serif text-heading tabular-nums @md:text-heading-lg">
              {{ resolvedMetric.value }}
            </p>
            <p v-if="resolvedMetric.delta" class="flex flex-wrap items-center gap-2">
              <Badge :variant="toneBadge[resolvedMetric.tone ?? 'neutral']" size="sm">{{
                resolvedMetric.delta
              }}</Badge>
              <span v-if="resolvedMetric.caption" class="text-ui-xs text-muted-foreground">{{
                resolvedMetric.caption
              }}</span>
            </p>
          </div>
          <SparkChart
            v-if="trendPoints.length > 1"
            :points="trendPoints"
            :width="240"
            :height="64"
            area
            show-last-point
            :aria-label="`${label} trend`"
            class="w-full shrink-0 @sm:w-40 @md:w-56 @lg:w-72"
          />
        </div>
      </Card.Content>
    </Card.Root>
  </section>
</template>
