<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Card, Skeleton } from "@moderno-ui/vue";

interface CategorySummary {
  id: string;
  name: string;
  description: string;
  countLabel?: string;
  imageUrl?: string;
  href?: string;
}

const sampleCategories: CategorySummary[] = [
  {
    id: "workspace",
    name: "Workspace",
    description: "Desks, chairs and lamps for the long days.",
    countLabel: "32 products",
    href: "#",
  },
  {
    id: "stationery",
    name: "Stationery",
    description: "Notebooks, pens and paper that hold up.",
    countLabel: "48 products",
    href: "#",
  },
  {
    id: "bags",
    name: "Bags",
    description: "Carry-alls for the commute and the weekend.",
    countLabel: "18 products",
    href: "#",
  },
  {
    id: "tech-accessories",
    name: "Tech accessories",
    description: "Stands, cables and cases in one place.",
    countLabel: "26 products",
    href: "#",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

const linkClass =
  "rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline";

const props = withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    allCategoriesHref?: string;
    categories?: CategorySummary[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "Shop by category",
    description: "Everything in the store, sorted the way you shop.",
    allCategoriesHref: "#",
    categories: undefined,
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
  <section class="@container moderno-block-category-preview text-foreground">
    <div class="grid gap-10 px-4 py-12 @lg:py-16">
      <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
        <div class="grid max-w-md gap-3">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
          <p v-if="description" class="text-body text-muted-foreground">{{ description }}</p>
        </div>
        <a
          v-if="allCategoriesHref"
          :class="['justify-self-start shrink-0 text-ui-md font-medium', linkClass]"
          :href="disabled ? undefined : allCategoriesHref"
          :role="disabled ? 'link' : undefined"
          :aria-disabled="disabled || undefined"
          >Browse all categories</a
        >
      </div>

      <Alert.Root v-if="error" variant="error">
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
        v-else-if="loading"
        role="status"
        aria-busy="true"
        class="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4 @lg:gap-8"
      >
        <span class="sr-only">Loading the categories…</span>
        <Card.Root
          v-for="key in placeholders"
          :key="key"
          size="sm"
          class="overflow-hidden"
          aria-hidden="true"
        >
          <Skeleton shape="rect" class="aspect-4/3 h-auto" />
          <Card.Header>
            <Skeleton shape="text" class="w-1/2" />
          </Card.Header>
          <Card.Content class="gap-2">
            <Skeleton shape="text" />
            <Skeleton shape="text" class="w-2/3" />
          </Card.Content>
          <Card.Footer>
            <Skeleton shape="text" class="w-1/3" />
          </Card.Footer>
        </Card.Root>
      </div>
      <p
        v-else-if="resolvedCategories.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No categories to show yet.
      </p>
      <ul v-else class="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4 @lg:gap-8">
        <li v-for="category in resolvedCategories" :key="category.id" class="flex">
          <Card.Root size="sm" class="relative overflow-hidden">
            <div class="flex aspect-4/3 items-center justify-center bg-muted">
              <img
                v-if="category.imageUrl"
                :src="category.imageUrl"
                alt=""
                class="size-full object-cover"
              />
              <span
                v-else
                aria-hidden="true"
                class="font-serif text-heading-lg text-muted-foreground"
                >{{ category.name.charAt(0) }}</span
              >
            </div>
            <Card.Header>
              <Card.Title class="text-balance">
                <a
                  v-if="category.href"
                  :class="['after:absolute after:inset-0', linkClass]"
                  :href="disabled ? undefined : category.href"
                  :role="disabled ? 'link' : undefined"
                  :aria-disabled="disabled || undefined"
                  >{{ category.name }}</a
                >
                <template v-else>{{ category.name }}</template>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="text-pretty text-muted-foreground">{{ category.description }}</p>
            </Card.Content>
            <Card.Footer v-if="category.countLabel">
              <span class="text-ui-sm text-muted-foreground">{{ category.countLabel }}</span>
            </Card.Footer>
          </Card.Root>
        </li>
      </ul>
    </div>
  </section>
</template>
