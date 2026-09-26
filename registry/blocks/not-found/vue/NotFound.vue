<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/vue";

interface NotFoundLink {
  label: string;
  description?: string;
  href: string;
}

const props = withDefaults(
  defineProps<{
    code?: string;
    title?: string;
    description?: string;
    primaryAction?: string;
    secondaryAction?: string;
    linksTitle?: string;
    links?: NotFoundLink[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    code: "404",
    title: "Page not found",
    description:
      "The page you are looking for has moved, or the link that brought you here is out of date.",
    primaryAction: "Back to home",
    secondaryAction: "Contact support",
    linksTitle: "Popular pages",
    links: () => [
      { label: "Pricing", description: "Plans for teams of every size.", href: "#" },
      { label: "Help centre", description: "Guides and answers to common questions.", href: "#" },
      { label: "Changelog", description: "What changed in the product this month.", href: "#" },
    ],
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

const placeholders = ["first", "second", "third"];

const hasActions = computed(() => Boolean(props.primaryAction || props.secondaryAction));
const hasPages = computed(() => Boolean(props.error) || props.loading || props.links.length > 0);
</script>

<template>
  <section class="@container moderno-block-not-found text-foreground">
    <div
      class="grid gap-12 px-4 py-12 @lg:gap-16 @lg:py-24"
      :class="{ '@lg:grid-cols-2 @lg:items-center': hasPages }"
    >
      <div
        class="grid justify-items-center gap-6 text-center"
        :class="{ '@lg:justify-items-start @lg:text-start': hasPages }"
      >
        <Badge v-if="code" variant="neutral">{{ code }}</Badge>

        <div class="grid max-w-md gap-3">
          <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{{ title }}</h1>
          <p v-if="description" class="text-body text-pretty text-muted-foreground">
            {{ description }}
          </p>
        </div>

        <div v-if="hasActions" class="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
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

      <Alert.Root
        v-if="error"
        variant="error"
        class="w-full max-w-md justify-self-center @lg:max-w-none"
      >
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
        v-else-if="loading"
        role="status"
        aria-busy="true"
        class="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
      >
        <span class="sr-only">Loading pages…</span>
        <Skeleton aria-hidden="true" shape="text" class="w-1/3" />
        <div aria-hidden="true" class="grid gap-5 rounded-lg border border-border p-4">
          <div v-for="key in placeholders" :key="key" class="grid gap-2">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="text" class="w-3/4" />
          </div>
        </div>
      </div>
      <nav
        v-else-if="links.length > 0"
        :aria-label="linksTitle"
        class="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
      >
        <h2 class="text-ui-sm font-semibold text-muted-foreground">{{ linksTitle }}</h2>
        <ul
          class="grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground"
        >
          <li v-for="link in links" :key="link.label" class="grid">
            <a
              class="grid gap-1 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              :href="link.href"
            >
              <span class="text-ui-md font-medium">{{ link.label }}</span>
              <span v-if="link.description" class="text-ui-sm text-muted-foreground">
                {{ link.description }}
              </span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </section>
</template>
