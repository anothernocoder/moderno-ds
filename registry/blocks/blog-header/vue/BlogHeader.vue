<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Chip, Skeleton } from "@moderno-ui/vue";

interface BlogCategory {
  id: string;
  label: string;
  href: string;
}

const sampleCategories: BlogCategory[] = [
  { id: "all", label: "All posts", href: "#" },
  { id: "product", label: "Product", href: "#" },
  { id: "engineering", label: "Engineering", href: "#" },
  { id: "design", label: "Design", href: "#" },
  { id: "company", label: "Company", href: "#" },
  { id: "guides", label: "Guides", href: "#" },
];

const props = withDefaults(
  defineProps<{
    kicker?: string;
    title?: string;
    description?: string;
    categories?: BlogCategory[];
    activeCategory?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    kicker: "Blog",
    title: "Notes from the ledger",
    description:
      "Product updates, engineering deep dives and guides to closing the month without the stress.",
    categories: undefined,
    activeCategory: "all",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  retry: [];
}>();

const resolvedCategories = computed(() => props.categories ?? sampleCategories);
</script>

<template>
  <header class="@container moderno-block-blog-header text-foreground">
    <div class="grid justify-items-center gap-8 px-4 py-12 text-center @lg:gap-10 @lg:py-16">
      <div class="grid max-w-md gap-3">
        <p v-if="kicker" class="text-ui-sm font-medium text-muted-foreground">{{ kicker }}</p>
        <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{{ title }}</h1>
        <p v-if="description" class="text-ui-md text-pretty text-muted-foreground @sm:text-body">
          {{ description }}
        </p>
      </div>

      <Alert.Root v-if="error" variant="error" class="w-full max-w-md text-start">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            The posts still load. Try again to bring the categories back.
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
        v-else-if="loading"
        role="status"
        aria-busy="true"
        class="flex flex-wrap justify-center gap-2 @md:gap-3"
      >
        <span class="sr-only">Loading the categories…</span>
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-20" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-16" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-24" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-16" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-20" />
      </div>
      <p
        v-else-if="resolvedCategories.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-3 text-ui-sm text-muted-foreground"
      >
        No categories yet.
      </p>
      <nav v-else aria-label="Categories">
        <ul class="flex flex-wrap justify-center gap-2 @md:gap-3">
          <li v-for="category in resolvedCategories" :key="category.id" class="flex">
            <a
              class="flex rounded-lg hover:[--border:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed"
              :href="disabled ? undefined : category.href"
              :role="disabled ? 'link' : undefined"
              :aria-disabled="disabled || undefined"
              :aria-current="category.id === activeCategory ? 'page' : undefined"
            >
              <Chip
                :variant="category.id === activeCategory ? 'solid' : disabled ? 'muted' : 'outline'"
              >
                {{ category.label }}
              </Chip>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
