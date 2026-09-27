<script setup lang="ts">
import { computed, useId } from "vue";
import { Alert, Button, Card, Skeleton, Switch } from "@moderno-ui/vue";

type ActionPanelVariant = "default" | "destructive";

interface ActionPanelItem {
  id: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
  action?: string;
}

const sampleItems: ActionPanelItem[] = [
  {
    id: "comments",
    title: "Comments",
    description: "Email me when someone comments on a document I own.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    title: "Mentions",
    description: "Email me when a teammate mentions me.",
    defaultChecked: true,
  },
  {
    id: "digest",
    title: "Weekly digest",
    description: "A Monday summary of what changed in the workspace.",
  },
  {
    id: "export",
    title: "Export data",
    description: "Download every document and comment as one archive.",
    action: "Export",
  },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    items?: ActionPanelItem[];
    heading?: string;
    description?: string;
    variant?: ActionPanelVariant;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    items: undefined,
    heading: "Workspace settings",
    description: "Changes apply as soon as you make them.",
    variant: "default",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  checkedChange: [id: string, checked: boolean];
  action: [id: string];
  retry: [];
}>();

const uid = useId();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedItems = computed(() => props.items ?? sampleItems);

const destructive = computed(() => props.variant === "destructive");
const inert = computed(() => props.loading || props.disabled);
const showRows = computed(() => !props.error && !props.loading && resolvedItems.value.length > 0);

const descriptionId = (id: string) => `${uid}-${id}-description`;
</script>

<template>
  <section class="@container moderno-block-action-panel text-foreground">
    <div class="grid gap-4 @lg:grid-cols-3 @lg:gap-8">
      <div class="grid content-start gap-1">
        <h2
          :class="
            destructive
              ? 'text-body-lg font-semibold text-destructive @md:text-heading-sm'
              : 'text-body-lg font-semibold @md:text-heading-sm'
          "
        >
          {{ heading }}
        </h2>
        <p v-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
      </div>

      <Card.Root :class="destructive ? 'border-destructive @lg:col-span-2' : '@lg:col-span-2'">
        <Card.Content class="gap-0 p-4 @sm:p-6">
          <Alert.Root v-if="error" variant="error">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
              <Alert.Description>
                Nothing was changed. Your settings are still saved.
              </Alert.Description>
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
              class="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
            >
              <div class="grid w-full gap-2">
                <Skeleton shape="text" class="w-1/3" />
                <Skeleton shape="text" class="w-2/3" />
              </div>
              <Skeleton shape="rect" class="h-5 w-9 shrink-0" />
            </div>
            <span class="sr-only">Loading settings…</span>
          </div>

          <div
            v-if="!error && !loading && resolvedItems.length === 0"
            class="grid gap-1 py-4 text-center"
          >
            <p class="text-ui-md font-medium">No settings yet</p>
            <p class="text-ui-md text-muted-foreground">
              Settings added to this panel show up here.
            </p>
          </div>

          <ul v-if="showRows" class="divide-y divide-border">
            <li v-for="item in resolvedItems" :key="item.id" class="py-4 first:pt-0 last:pb-0">
              <div
                v-if="item.action"
                class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
              >
                <div class="grid gap-1">
                  <p class="text-ui-md font-medium">{{ item.title }}</p>
                  <p :id="descriptionId(item.id)" class="text-ui-md text-muted-foreground">
                    {{ item.description }}
                  </p>
                </div>
                <Button
                  type="button"
                  :variant="destructive ? 'destructive' : 'outline'"
                  size="sm"
                  class="shrink-0"
                  :disabled="inert"
                  :aria-describedby="descriptionId(item.id)"
                  @click="emit('action', item.id)"
                >
                  {{ item.action }}
                </Button>
              </div>
              <Switch.Root
                v-else
                :default-checked="item.defaultChecked"
                :disabled="inert"
                class="grid justify-items-start gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-6"
                @checked-change="({ checked }) => emit('checkedChange', item.id, checked)"
              >
                <span class="grid gap-1">
                  <Switch.Label class="font-medium">{{ item.title }}</Switch.Label>
                  <span :id="descriptionId(item.id)" class="text-ui-md text-muted-foreground">
                    {{ item.description }}
                  </span>
                </span>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.HiddenInput :aria-describedby="descriptionId(item.id)" />
              </Switch.Root>
            </li>
          </ul>
        </Card.Content>
      </Card.Root>
    </div>
  </section>
</template>
