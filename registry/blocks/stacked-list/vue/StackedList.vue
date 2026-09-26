<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/vue";

type StackedListStatus = "neutral" | "info" | "success" | "warning" | "error";

interface StackedListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  image?: string;
  status?: string;
  statusVariant?: StackedListStatus;
  meta?: string;
}

const sampleItems: StackedListItem[] = [
  {
    id: "leslie",
    title: "Leslie Alexander",
    subtitle: "leslie.alexander@example.com",
    initials: "LA",
    status: "Active",
    statusVariant: "success",
    meta: "Last seen 3 hrs ago",
  },
  {
    id: "michael",
    title: "Michael Foster",
    subtitle: "michael.foster@example.com",
    initials: "MF",
    status: "Invited",
    statusVariant: "info",
    meta: "Invited 2 days ago",
  },
  {
    id: "dries",
    title: "Dries Vincent",
    subtitle: "dries.vincent@example.com",
    initials: "DV",
    status: "Away",
    statusVariant: "warning",
    meta: "Last seen yesterday",
  },
  {
    id: "lindsay",
    title: "Lindsay Walton",
    subtitle: "lindsay.walton@example.com",
    initials: "LW",
    status: "Suspended",
    statusVariant: "error",
    meta: "Suspended last week",
  },
  {
    id: "courtney",
    title: "Courtney Henry",
    subtitle: "courtney.henry@example.com",
    initials: "CH",
    status: "Guest",
    statusVariant: "neutral",
    meta: "Last seen 2 weeks ago",
  },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    items?: StackedListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    items: undefined,
    heading: "Team members",
    description: "Everyone with access to this workspace.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  view: [id: string];
  invite: [];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedItems = computed(() => props.items ?? sampleItems);

const inert = computed(() => props.loading || props.disabled);
const showRows = computed(() => !props.loading && resolvedItems.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-stacked-list text-foreground">
    <div class="grid gap-4">
      <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
        <div class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
          <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
        </div>
        <Button type="button" size="sm" :disabled="inert" @click="emit('invite')">
          Invite member
        </Button>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Nothing was changed. Your team is still saved.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>

      <Card.Root v-else>
        <Card.Content class="gap-0 p-4 @sm:p-6">
          <div v-if="loading" role="status" aria-busy="true" class="grid">
            <div
              v-for="key in placeholders"
              :key="key"
              aria-hidden="true"
              class="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <Skeleton shape="circle" class="size-10 shrink-0" />
              <div class="grid flex-1 gap-2">
                <Skeleton shape="text" class="w-1/3" />
                <Skeleton shape="text" class="w-2/3" />
              </div>
            </div>
            <span class="sr-only">Loading team members…</span>
          </div>

          <div v-if="!loading && resolvedItems.length === 0" class="grid gap-1 py-4 text-center">
            <p class="text-ui-md font-medium">No members yet</p>
            <p class="text-ui-md text-muted-foreground">People you invite show up here.</p>
          </div>

          <ul v-if="showRows" class="divide-y divide-border">
            <li
              v-for="item in resolvedItems"
              :key="item.id"
              class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:gap-4"
            >
              <div class="flex w-full min-w-0 flex-1 items-start gap-3 @md:items-center">
                <Avatar.Root>
                  <Avatar.Fallback>{{ item.initials }}</Avatar.Fallback>
                  <Avatar.Image v-if="item.image" :src="item.image" alt="" />
                </Avatar.Root>
                <div
                  class="grid min-w-0 flex-1 gap-2 @md:flex @md:items-center @md:justify-between @md:gap-4"
                >
                  <div class="grid min-w-0 gap-1">
                    <p class="truncate text-ui-md font-medium">{{ item.title }}</p>
                    <p v-if="item.subtitle" class="truncate text-ui-md text-muted-foreground">
                      {{ item.subtitle }}
                    </p>
                  </div>
                  <div
                    v-if="item.status || item.meta"
                    class="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-3"
                  >
                    <Badge v-if="item.status" :variant="item.statusVariant ?? 'neutral'" dot>
                      {{ item.status }}
                    </Badge>
                    <span v-if="item.meta" class="text-ui-sm text-muted-foreground">
                      {{ item.meta }}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="shrink-0"
                :disabled="inert"
                :aria-label="`View ${item.title}`"
                @click="emit('view', item.id)"
              >
                View
              </Button>
            </li>
          </ul>
        </Card.Content>
      </Card.Root>
    </div>
  </section>
</template>
