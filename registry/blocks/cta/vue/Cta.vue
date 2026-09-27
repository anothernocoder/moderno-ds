<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Skeleton } from "@moderno-ui/vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    primaryAction?: string;
    secondaryAction?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    title: "Close the month in minutes, not days",
    description:
      "Bring invoices, receipts and bank feeds into one calm workspace. Free for 30 days.",
    primaryAction: "Start free trial",
    secondaryAction: "Talk to sales",
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

const hasActions = computed(() => Boolean(props.primaryAction || props.secondaryAction));
</script>

<template>
  <section class="@container moderno-block-cta">
    <div class="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
      <div
        v-if="loading"
        role="status"
        aria-busy="true"
        class="grid justify-items-center gap-6 @lg:flex @lg:items-center @lg:justify-between @lg:gap-10"
      >
        <div
          aria-hidden="true"
          class="grid w-full max-w-md justify-items-center gap-3 @lg:justify-items-start"
        >
          <Skeleton shape="text" class="h-7 w-3/4 @md:h-8" />
          <Skeleton shape="text" class="w-full" />
        </div>
        <div aria-hidden="true" class="flex gap-3 @lg:shrink-0">
          <Skeleton shape="rect" class="h-10 w-32" />
          <Skeleton shape="rect" class="h-10 w-28" />
        </div>
        <span class="sr-only">Loading…</span>
      </div>

      <div
        v-else
        class="grid justify-items-center gap-6 text-center @lg:flex @lg:items-center @lg:justify-between @lg:gap-10 @lg:text-start"
      >
        <div class="grid max-w-md gap-2">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ title }}</h2>
          <p v-if="description" class="text-body text-pretty text-muted-foreground">
            {{ description }}
          </p>
        </div>

        <Alert.Root v-if="error" variant="error" class="w-full max-w-md text-start @lg:max-w-sm">
          <Alert.Content>
            <Alert.Title>{{ error }}</Alert.Title>
            <Alert.Description>The rest of the page still works.</Alert.Description>
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
          v-else-if="hasActions"
          class="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center @lg:shrink-0"
        >
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
        </div>
      </div>
    </div>
  </section>
</template>
