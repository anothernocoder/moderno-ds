<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/vue";

type StatRowTone = "positive" | "negative" | "neutral";

interface StatRowItem {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: StatRowTone;
  caption?: string;
}

const sampleStats: StatRowItem[] = [
  {
    id: "revenue",
    label: "Revenue",
    value: "$48,294",
    delta: "+12.5%",
    tone: "positive",
    caption: "vs last month",
  },
  {
    id: "customers",
    label: "Active customers",
    value: "2,318",
    delta: "+4.1%",
    tone: "positive",
    caption: "vs last month",
  },
  {
    id: "churn",
    label: "Churn rate",
    value: "1.9%",
    delta: "−0.4 pts",
    tone: "positive",
    caption: "vs last month",
  },
  {
    id: "order-value",
    label: "Average order",
    value: "$86.40",
    delta: "−2.4%",
    tone: "negative",
    caption: "vs last month",
  },
];

const toneBadge: Record<StatRowTone, BadgeVariant> = {
  positive: "success",
  negative: "error",
  neutral: "neutral",
};

const placeholders = ["first", "second", "third", "fourth"];

const props = withDefaults(
  defineProps<{
    stats?: StatRowItem[];
    heading?: string;
    description?: string;
    actionLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    stats: undefined,
    heading: "Overview",
    description: "The last 30 days, compared with the 30 before.",
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
const resolvedStats = computed(() => props.stats ?? sampleStats);

const showStats = computed(() => !props.error && !props.loading && resolvedStats.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-stat-row text-foreground">
    <div class="grid gap-4">
      <div class="grid gap-3 @sm:flex @sm:items-end @sm:justify-between">
        <div class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
          <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
        </div>
        <Button
          v-if="actionLabel"
          type="button"
          variant="outline"
          size="sm"
          class="justify-self-start"
          :disabled="disabled || !showStats"
          @click="emit('action')"
        >
          {{ actionLabel }}
        </Button>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            The numbers are safe; only this view failed to load.
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
        v-if="!error && loading"
        role="status"
        aria-busy="true"
        class="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-4"
      >
        <span class="sr-only">Loading stats…</span>
        <Card.Root v-for="key in placeholders" :key="key" size="sm">
          <Card.Content class="gap-2">
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="h-8 w-3/4 @md:h-10" />
            <Skeleton shape="text" class="w-2/3" />
          </Card.Content>
        </Card.Root>
      </div>

      <Card.Root v-if="!error && !loading && resolvedStats.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>No numbers yet</Card.Title>
          <Card.Description>
            Stats appear here once there is activity in this period.
          </Card.Description>
        </Card.Header>
      </Card.Root>

      <ul v-if="showStats" class="grid gap-3 @sm:grid-cols-2 @lg:grid-cols-4">
        <li v-for="stat in resolvedStats" :key="stat.id" class="flex">
          <Card.Root size="sm">
            <Card.Content class="gap-2">
              <p class="text-ui-md text-muted-foreground">{{ stat.label }}</p>
              <p class="font-serif text-heading tabular-nums @md:text-heading-lg">
                {{ stat.value }}
              </p>
              <p v-if="stat.delta" class="flex flex-wrap items-center gap-2">
                <Badge :variant="toneBadge[stat.tone ?? 'neutral']" size="sm">{{
                  stat.delta
                }}</Badge>
                <span v-if="stat.caption" class="text-ui-xs text-muted-foreground">{{
                  stat.caption
                }}</span>
              </p>
            </Card.Content>
          </Card.Root>
        </li>
      </ul>
    </div>
  </section>
</template>
