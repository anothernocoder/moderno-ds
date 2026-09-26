<script setup lang="ts">
import { computed } from "vue";
import { Button, Skeleton } from "@moderno-ui/vue";

type EmptyStateIcon = "folder" | "search" | "inbox";

const iconPaths: Record<EmptyStateIcon | "error", string[]> = {
  folder: [
    "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
    "M12 10v6",
    "M9 13h6",
  ],
  search: ["M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z", "m21 21-4.3-4.3"],
  inbox: [
    "M22 12h-6l-2 3h-4l-2-3H2",
    "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z",
  ],
  error: ["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z", "M12 8v4", "M12 16h.01"],
};

const props = withDefaults(
  defineProps<{
    icon?: EmptyStateIcon;
    title?: string;
    description?: string;
    primaryAction?: string;
    secondaryAction?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    icon: "folder",
    title: "No projects yet",
    description:
      "Projects keep your documents, tasks and teammates in one place. Create one to get started.",
    primaryAction: "New project",
    secondaryAction: "Import",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  primaryAction: [];
  secondaryAction: [];
  retry: [];
}>();

const glyph = computed(() => iconPaths[props.error ? "error" : props.icon]);
const hasActions = computed(() =>
  Boolean(props.error || props.primaryAction || props.secondaryAction),
);
</script>

<template>
  <section class="@container moderno-block-empty-state text-foreground">
    <div
      v-if="loading"
      role="status"
      aria-busy="true"
      class="grid justify-items-center gap-4 px-4 py-8 @lg:py-16"
    >
      <Skeleton aria-hidden="true" shape="rect" class="size-10 @md:size-12" />
      <div aria-hidden="true" class="grid w-full max-w-sm justify-items-center gap-2">
        <Skeleton shape="text" class="w-1/2" />
        <Skeleton shape="text" class="w-3/4" />
      </div>
      <Skeleton aria-hidden="true" shape="rect" class="h-9 w-32" />
      <span class="sr-only">Loading…</span>
    </div>

    <div v-else class="grid justify-items-center gap-4 px-4 py-8 text-center @lg:py-16">
      <div
        :class="
          error
            ? 'grid size-10 place-items-center rounded-lg border border-border bg-muted text-destructive @md:size-12'
            : 'grid size-10 place-items-center rounded-lg border border-border bg-muted text-muted-foreground @md:size-12'
        "
      >
        <svg
          class="size-5 @md:size-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path v-for="d in glyph" :key="d" :d="d" />
        </svg>
      </div>

      <div :role="error ? 'alert' : undefined" class="grid max-w-sm gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{{ error ?? title }}</h2>
        <p v-if="error" class="text-ui-md text-muted-foreground">
          Nothing was lost. Check your connection, then try again.
        </p>
        <p v-else-if="description" class="text-ui-md text-muted-foreground">{{ description }}</p>
      </div>

      <div
        v-if="hasActions"
        class="mt-2 grid w-full gap-2 @sm:flex @sm:w-auto @sm:justify-center @sm:gap-3"
      >
        <Button v-if="error" type="button" :disabled="disabled" @click="emit('retry')">
          Try again
        </Button>
        <template v-else>
          <Button
            v-if="primaryAction"
            type="button"
            :disabled="disabled"
            @click="emit('primaryAction')"
          >
            {{ primaryAction }}
          </Button>
          <Button
            v-if="secondaryAction"
            type="button"
            variant="outline"
            :disabled="disabled"
            @click="emit('secondaryAction')"
          >
            {{ secondaryAction }}
          </Button>
        </template>
      </div>
    </div>
  </section>
</template>
