<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/vue";

const props = withDefaults(
  defineProps<{
    kicker?: string;
    title?: string;
    subtitle?: string;
    primaryAction?: string;
    secondaryAction?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    kicker: "Now in public beta",
    title: "Run your business, not your books",
    subtitle:
      "Invoices, time tracking and receipts in one calm workspace, so the numbers are ready before you need them.",
    primaryAction: "Start free trial",
    secondaryAction: "Book a demo",
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
  <section class="@container moderno-block-hero text-foreground">
    <div
      v-if="loading"
      role="status"
      aria-busy="true"
      class="grid justify-items-center gap-6 px-4 py-12 @lg:py-24"
    >
      <Skeleton aria-hidden="true" shape="rect" class="h-6 w-36" />
      <div aria-hidden="true" class="grid w-full max-w-lg justify-items-center gap-3">
        <Skeleton shape="text" class="h-8 w-full @md:h-10" />
        <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
      </div>
      <div aria-hidden="true" class="grid w-full max-w-md justify-items-center gap-2">
        <Skeleton shape="text" class="w-full" />
        <Skeleton shape="text" class="w-3/4" />
      </div>
      <Skeleton aria-hidden="true" shape="rect" class="h-10 w-40" />
      <span class="sr-only">Loading…</span>
    </div>

    <div v-else class="grid justify-items-center gap-6 px-4 py-12 text-center @lg:py-24">
      <Badge v-if="kicker" variant="neutral">{{ kicker }}</Badge>

      <div class="grid max-w-lg gap-4">
        <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{{ title }}</h1>
        <p
          v-if="subtitle"
          class="mx-auto max-w-md text-body text-muted-foreground @md:text-body-lg"
        >
          {{ subtitle }}
        </p>
      </div>

      <Alert.Root v-if="error" variant="error" class="w-full max-w-md text-start">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            The rest of the page still works. Try again in a moment.
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
        v-else-if="hasActions"
        class="mt-2 grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center"
      >
        <Button
          v-if="primaryAction"
          type="button"
          size="lg"
          :disabled="disabled"
          @click="emit('primaryAction')"
        >
          {{ primaryAction }}
        </Button>
        <Button
          v-if="secondaryAction"
          type="button"
          variant="outline"
          size="lg"
          :disabled="disabled"
          @click="emit('secondaryAction')"
        >
          {{ secondaryAction }}
        </Button>
      </div>
    </div>
  </section>
</template>
