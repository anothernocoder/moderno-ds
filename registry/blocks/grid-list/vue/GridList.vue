<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/vue";

type GridListStatus = "neutral" | "info" | "success" | "warning" | "error";

interface GridListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  image?: string;
  status?: string;
  statusVariant?: GridListStatus;
  meta?: string;
}

const sampleItems: GridListItem[] = [
  {
    id: "checkout",
    title: "Checkout redesign",
    subtitle: "Product team",
    initials: "CR",
    status: "In progress",
    statusVariant: "info",
    meta: "Updated 2 hrs ago",
  },
  {
    id: "payments",
    title: "Payments API v2",
    subtitle: "Platform team",
    initials: "PA",
    status: "Blocked",
    statusVariant: "error",
    meta: "Updated yesterday",
  },
  {
    id: "campaign",
    title: "Summer campaign",
    subtitle: "Marketing",
    initials: "SC",
    status: "Paused",
    statusVariant: "warning",
    meta: "Updated 3 days ago",
  },
  {
    id: "migration",
    title: "Vue 3 migration",
    subtitle: "Platform team",
    initials: "VM",
    status: "Shipped",
    statusVariant: "success",
    meta: "Updated last week",
  },
  {
    id: "brand",
    title: "Brand refresh",
    subtitle: "Design",
    initials: "BR",
    status: "Draft",
    statusVariant: "neutral",
    meta: "Updated 2 weeks ago",
  },
  {
    id: "onboarding",
    title: "Mobile onboarding",
    subtitle: "Product team",
    initials: "MO",
    status: "In progress",
    statusVariant: "info",
    meta: "Updated last month",
  },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    items?: GridListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    items: undefined,
    heading: "Projects",
    description: "Everything your team is working on, most recent first.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  open: [id: string];
  create: [];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedItems = computed(() => props.items ?? sampleItems);

const inert = computed(() => props.loading || props.disabled);
const showGrid = computed(() => !props.error && !props.loading && resolvedItems.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-grid-list text-foreground">
    <div class="grid gap-4">
      <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
        <div class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
          <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
        </div>
        <Button type="button" size="sm" :disabled="inert" @click="emit('create')">
          New project
        </Button>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Nothing was changed. Your projects are still saved.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>

      <div
        v-if="loading"
        role="status"
        aria-busy="true"
        class="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3"
      >
        <span class="sr-only">Loading projects…</span>
        <Card.Root v-for="key in placeholders" :key="key" size="sm" aria-hidden="true">
          <Card.Header class="flex-row items-center gap-3">
            <Skeleton shape="rect" class="size-10" />
            <div class="grid flex-1 gap-2">
              <Skeleton shape="text" class="w-3/4" />
              <Skeleton shape="text" class="w-1/2" />
            </div>
          </Card.Header>
          <Card.Content>
            <Skeleton shape="text" class="w-1/3" />
          </Card.Content>
          <Card.Footer>
            <Skeleton shape="text" class="h-8" />
          </Card.Footer>
        </Card.Root>
      </div>

      <Card.Root v-if="!error && !loading && resolvedItems.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>No projects yet</Card.Title>
          <Card.Description>Projects you create or join show up here as cards.</Card.Description>
        </Card.Header>
      </Card.Root>

      <ul v-if="showGrid" class="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
        <li v-for="item in resolvedItems" :key="item.id" class="flex">
          <Card.Root size="sm">
            <Card.Header class="flex-row items-center gap-3">
              <Avatar.Root shape="square">
                <Avatar.Fallback>{{ item.initials }}</Avatar.Fallback>
                <Avatar.Image v-if="item.image" :src="item.image" alt="" />
              </Avatar.Root>
              <div class="grid min-w-0 flex-1 gap-1">
                <Card.Title class="truncate">{{ item.title }}</Card.Title>
                <Card.Description v-if="item.subtitle" class="truncate">
                  {{ item.subtitle }}
                </Card.Description>
              </div>
            </Card.Header>
            <Card.Content class="flex-row flex-wrap items-center gap-2">
              <Badge v-if="item.status" :variant="item.statusVariant ?? 'neutral'" dot>
                {{ item.status }}
              </Badge>
              <span v-if="item.meta" class="text-ui-sm text-muted-foreground">{{ item.meta }}</span>
            </Card.Content>
            <Card.Footer>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="w-full"
                :disabled="inert"
                :aria-label="`Open ${item.title}`"
                @click="emit('open', item.id)"
              >
                Open
              </Button>
            </Card.Footer>
          </Card.Root>
        </li>
      </ul>
    </div>
  </section>
</template>
