<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Field } from "@moderno-ui/vue";

const props = withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    note?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    subscribed?: boolean;
  }>(),
  {
    heading: "One calm email a month",
    description: "Product news, closing tips and the odd template, from the team that builds it.",
    note: "No spam. Unsubscribe with one click.",
    error: undefined,
    loading: false,
    disabled: false,
    subscribed: false,
  },
);

const emit = defineEmits<{ submit: [event: Event] }>();

const inert = computed(() => props.loading || props.disabled);
</script>

<template>
  <section class="@container moderno-block-newsletter">
    <div class="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
      <div
        class="grid justify-items-center gap-6 text-center @lg:grid-cols-2 @lg:items-center @lg:justify-items-stretch @lg:gap-10 @lg:text-start"
      >
        <div class="grid max-w-md gap-2">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
          <p v-if="description" class="text-body text-pretty text-muted-foreground">
            {{ description }}
          </p>
        </div>

        <Alert.Root v-if="subscribed" variant="success" class="w-full max-w-md text-start">
          <Alert.Content>
            <Alert.Title>You are subscribed</Alert.Title>
            <Alert.Description>Check your inbox to confirm your email.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <form v-else class="grid w-full max-w-md gap-3" novalidate @submit="emit('submit', $event)">
          <div class="grid gap-3 text-start @sm:flex @sm:items-start">
            <Field.Root
              required
              :invalid="Boolean(error)"
              :disabled="inert"
              class="relative min-w-0 @sm:flex-1"
            >
              <Field.Label class="sr-only">Email address</Field.Label>
              <Field.Input
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
              />
              <Field.ErrorText>{{ error }}</Field.ErrorText>
            </Field.Root>
            <Button type="submit" :disabled="inert" :aria-busy="loading" class="@sm:shrink-0">
              <template v-if="loading">
                <span
                  aria-hidden="true"
                  class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                Subscribing
              </template>
              <template v-else>Subscribe</template>
            </Button>
          </div>
          <p v-if="note" class="text-ui-sm text-muted-foreground">{{ note }}</p>
        </form>
      </div>
    </div>
  </section>
</template>
