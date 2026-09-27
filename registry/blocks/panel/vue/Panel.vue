<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Card, Skeleton } from "@moderno-ui/vue";

interface PanelItem {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
}

const samplePanels: PanelItem[] = [
  {
    id: "profile",
    title: "Profile",
    description: "Your name, photo and the bio other people see.",
    actionLabel: "Edit profile",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Which updates reach you by email and which stay in the app.",
    actionLabel: "Manage notifications",
  },
  {
    id: "billing",
    title: "Billing",
    description: "Your plan, your payment method and every past invoice.",
    actionLabel: "View billing",
  },
  {
    id: "security",
    title: "Security",
    description: "Two-step verification and the devices signed in to your account.",
    actionLabel: "Review security",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

const props = withDefaults(
  defineProps<{
    panels?: PanelItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    panels: undefined,
    heading: "Account settings",
    description: "Related options, grouped so each one is easy to find.",
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
const resolvedPanels = computed(() => props.panels ?? samplePanels);
</script>

<template>
  <section class="@container moderno-block-panel text-foreground">
    <div class="grid gap-4 @lg:gap-6">
      <div class="grid gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ heading }}</h2>
        <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
      </div>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description
            >Your settings are safe; only this view failed to load.</Alert.Description
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
        class="grid gap-3 @md:grid-cols-2 @lg:gap-4"
      >
        <span class="sr-only">Loading settings…</span>
        <Card.Root v-for="key in placeholders" :key="key" aria-hidden="true">
          <Card.Header class="gap-2">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="text" />
            <Skeleton shape="text" class="w-2/3" />
          </Card.Header>
          <Card.Footer>
            <Skeleton shape="rect" class="h-8 w-full @sm:w-32" />
          </Card.Footer>
        </Card.Root>
      </div>

      <Card.Root v-else-if="resolvedPanels.length === 0">
        <Card.Header class="items-center text-center">
          <Card.Title>Nothing to set up yet</Card.Title>
          <Card.Description
            >Settings appear here once there is something to change.</Card.Description
          >
        </Card.Header>
      </Card.Root>

      <ul v-else class="grid gap-3 @md:grid-cols-2 @lg:gap-4">
        <li v-for="panel in resolvedPanels" :key="panel.id" class="flex">
          <Card.Root>
            <Card.Header>
              <Card.Title>{{ panel.title }}</Card.Title>
              <Card.Description>{{ panel.description }}</Card.Description>
            </Card.Header>
            <Card.Footer v-if="panel.actionLabel" class="mt-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="w-full @sm:w-auto"
                :disabled="disabled"
                @click="emit('action', panel.id)"
              >
                {{ panel.actionLabel }}
              </Button>
            </Card.Footer>
          </Card.Root>
        </li>
      </ul>
    </div>
  </section>
</template>
