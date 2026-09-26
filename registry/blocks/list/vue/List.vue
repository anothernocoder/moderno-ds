<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/vue";

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  avatarUrl?: string;
  status?: string;
  statusVariant?: BadgeVariant;
  meta?: string;
}

const sampleItems: ListItem[] = [
  {
    id: "ana-lopez",
    title: "Ana López",
    subtitle: "ana.lopez@example.com",
    initials: "AL",
    status: "Active",
    statusVariant: "success",
    meta: "Online now",
  },
  {
    id: "ben-okafor",
    title: "Ben Okafor",
    subtitle: "ben.okafor@example.com",
    initials: "BO",
    status: "Invited",
    statusVariant: "info",
    meta: "Sent 2 days ago",
  },
  {
    id: "chen-wei",
    title: "Chen Wei",
    subtitle: "chen.wei@example.com",
    initials: "CW",
    status: "Active",
    statusVariant: "success",
    meta: "Seen 3 hrs ago",
  },
  {
    id: "dara-singh",
    title: "Dara Singh",
    subtitle: "dara.singh@example.com",
    initials: "DS",
    status: "Away",
    statusVariant: "warning",
    meta: "Back on Monday",
  },
  {
    id: "eli-moreau",
    title: "Eli Moreau",
    subtitle: "eli.moreau@example.com",
    initials: "EM",
    status: "Suspended",
    statusVariant: "error",
    meta: "Since last week",
  },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    items?: ListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    items: undefined,
    heading: "Team members",
    description: "People who can open and edit this workspace.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  invite: [];
  edit: [id: string];
  remove: [id: string];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedItems = computed(() => props.items ?? sampleItems);

const inert = computed(() => props.loading || props.disabled);
</script>

<template>
  <section class="@container moderno-block-list text-foreground">
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
          <Alert.Description>Nothing was changed. Your team is still in place.</Alert.Description>
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

      <Card.Root v-else-if="loading" size="sm">
        <div role="status" aria-busy="true">
          <span class="sr-only">Loading team members…</span>
          <div class="divide-y divide-border" aria-hidden="true">
            <div v-for="key in placeholders" :key="key" class="flex items-center gap-3 px-4 py-3">
              <Skeleton shape="circle" />
              <div class="grid flex-1 gap-2">
                <Skeleton shape="text" class="w-1/2" />
                <Skeleton shape="text" class="w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </Card.Root>

      <Card.Root v-else-if="resolvedItems.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>No members yet</Card.Title>
          <Card.Description>People you invite show up here, one row each.</Card.Description>
        </Card.Header>
      </Card.Root>

      <Card.Root v-else size="sm">
        <ul class="divide-y divide-border">
          <li
            v-for="item in resolvedItems"
            :key="item.id"
            class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 @sm:grid-cols-[auto_minmax(0,1fr)_auto] @md:grid-cols-[auto_minmax(0,1fr)_auto_auto] @md:gap-x-4"
          >
            <Avatar.Root>
              <Avatar.Fallback>{{ item.initials }}</Avatar.Fallback>
              <Avatar.Image v-if="item.avatarUrl" :src="item.avatarUrl" alt="" />
            </Avatar.Root>
            <div class="grid min-w-0 gap-0.5">
              <p class="truncate text-ui-md font-medium">{{ item.title }}</p>
              <p v-if="item.subtitle" class="truncate text-ui-sm text-muted-foreground">
                {{ item.subtitle }}
              </p>
            </div>
            <div
              v-if="item.status || item.meta"
              class="col-start-2 flex flex-wrap items-center gap-2 @md:col-start-3 @md:row-start-1 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-4"
            >
              <Badge v-if="item.status" :variant="item.statusVariant ?? 'neutral'" size="sm" dot>{{
                item.status
              }}</Badge>
              <span
                v-if="item.meta"
                class="text-ui-xs text-muted-foreground @lg:w-28 @lg:text-right"
                >{{ item.meta }}</span
              >
            </div>
            <div
              class="col-start-2 flex gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @md:col-start-4 @md:row-span-1"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                :aria-label="`Edit ${item.title}`"
                @click="emit('edit', item.id)"
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                :disabled="disabled"
                :aria-label="`Remove ${item.title}`"
                @click="emit('remove', item.id)"
              >
                Remove
              </Button>
            </div>
          </li>
        </ul>
      </Card.Root>
    </div>
  </section>
</template>
