<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Card, Divider, Skeleton } from "@moderno-ui/vue";

type DescriptionListBadge = "neutral" | "info" | "success" | "warning" | "error";

interface DescriptionListItem {
  id: string;
  term: string;
  value: string;
  badge?: DescriptionListBadge;
  action?: string;
}

const sampleItems: DescriptionListItem[] = [
  { id: "name", term: "Full name", value: "Margot Foster", action: "Change" },
  { id: "email", term: "Email", value: "margot.foster@example.com", action: "Change" },
  { id: "company", term: "Company", value: "Northwind Labs" },
  { id: "plan", term: "Plan", value: "Pro, billed yearly", action: "Change" },
  { id: "status", term: "Status", value: "Active", badge: "success" },
  { id: "since", term: "Customer since", value: "March 12, 2024" },
  {
    id: "notes",
    term: "Notes",
    value:
      "Prefers invoices in euros and a call before any plan change. Renewals go through the finance team.",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

const props = withDefaults(
  defineProps<{
    items?: DescriptionListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    items: undefined,
    heading: "Customer details",
    description: "Contact and billing details for this account.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [id: string];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedItems = computed(() => props.items ?? sampleItems);

const inert = computed(() => props.loading || props.disabled);
const showList = computed(() => !props.error && !props.loading && resolvedItems.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-description-list text-foreground">
    <div class="grid gap-4">
      <div class="grid gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
        <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
      </div>

      <Divider />

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Nothing was changed. The details are still saved.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>

      <div v-if="loading" role="status" aria-busy="true" class="grid">
        <div
          v-for="key in placeholders"
          :key="key"
          aria-hidden="true"
          class="grid gap-2 py-3 first:pt-0 @md:grid-cols-3 @md:gap-4 @lg:grid-cols-4"
        >
          <Skeleton shape="text" class="w-1/3 @md:w-2/3" />
          <Skeleton shape="text" class="w-2/3 @md:col-span-2 @lg:col-span-3" />
        </div>
        <span class="sr-only">Loading details…</span>
      </div>

      <Card.Root v-if="!error && !loading && resolvedItems.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>No details yet</Card.Title>
          <Card.Description>Details added to this record show up here.</Card.Description>
        </Card.Header>
      </Card.Root>

      <dl v-if="showList" class="divide-y divide-border">
        <div
          v-for="item in resolvedItems"
          :key="item.id"
          class="grid gap-1 py-3 first:pt-0 @md:grid-cols-3 @md:items-baseline @md:gap-4 @lg:grid-cols-4"
        >
          <dt class="text-ui-md text-muted-foreground">{{ item.term }}</dt>
          <dd
            class="grid justify-items-start gap-2 text-ui-md @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @md:col-span-2 @lg:col-span-3"
          >
            <Badge v-if="item.badge" :variant="item.badge" dot>{{ item.value }}</Badge>
            <span v-else class="min-w-0 break-words">{{ item.value }}</span>
            <Button
              v-if="item.action"
              type="button"
              variant="ghost"
              size="sm"
              class="-my-1 -ml-3 shrink-0 @sm:ml-0 @sm:-mr-3"
              :disabled="inert"
              :aria-label="`${item.action} ${item.term}`"
              @click="emit('action', item.id)"
            >
              {{ item.action }}
            </Button>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
