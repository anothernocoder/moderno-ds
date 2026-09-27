<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Alert,
  Badge,
  Button,
  Combobox,
  Drawer,
  Menu,
  Portal,
  Skeleton,
  createListCollection,
  useFilter,
  type ComboboxInputValueChangeDetails,
} from "@moderno-ui/vue";

interface StoreNavLink {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

interface StoreNavMenu {
  id: string;
  label: string;
  links: StoreNavLink[];
}

type StoreNavCategory = StoreNavLink | StoreNavMenu;

interface StoreNavSuggestion {
  value: string;
  label: string;
  href: string;
}

const sampleCategories: StoreNavCategory[] = [
  {
    id: "workspace",
    label: "Workspace",
    links: [
      { id: "desks", label: "Desks", href: "/workspace/desks" },
      { id: "chairs", label: "Chairs", href: "/workspace/chairs" },
      { id: "lamps", label: "Lamps", href: "/workspace/lamps" },
    ],
  },
  {
    id: "stationery",
    label: "Stationery",
    links: [
      { id: "notebooks", label: "Notebooks", href: "/stationery/notebooks" },
      { id: "pens", label: "Pens", href: "/stationery/pens" },
      { id: "planners", label: "Planners", href: "/stationery/planners" },
    ],
  },
  { id: "bags", label: "Bags", href: "/bags" },
];

const sampleSuggestions: StoreNavSuggestion[] = [
  { value: "oak-desk", label: "Oak standing desk", href: "/products/oak-standing-desk" },
  { value: "task-chair", label: "Mesh task chair", href: "/products/mesh-task-chair" },
  { value: "desk-lamp", label: "Brass desk lamp", href: "/products/brass-desk-lamp" },
  { value: "linen-notebook", label: "Linen notebook", href: "/products/linen-notebook" },
  { value: "fountain-pen", label: "Steel fountain pen", href: "/products/steel-fountain-pen" },
  { value: "canvas-tote", label: "Canvas tote", href: "/products/canvas-tote" },
];

const placeholders = ["first", "second", "third"];

const props = withDefaults(
  defineProps<{
    brand?: string;
    homeHref?: string;
    categories?: StoreNavCategory[];
    suggestions?: StoreNavSuggestion[];
    cartCount?: number;
    error?: string;
    loading?: boolean;
  }>(),
  {
    brand: "Northwind",
    homeHref: "/",
    categories: undefined,
    suggestions: undefined,
    cartCount: 2,
    error: undefined,
    loading: false,
  },
);

const emit = defineEmits<{
  search: [query: string];
  cart: [];
  retry: [];
}>();

const drawerOpen = ref(false);
const query = ref("");
const suggestionsOpen = ref(false);

const filters = useFilter({ sensitivity: "base" });
const shownCategories = computed(() => props.categories ?? sampleCategories);
const collection = computed(() =>
  createListCollection({
    items: (props.suggestions ?? sampleSuggestions).filter((suggestion) =>
      filters.value.contains(suggestion.label, query.value.trim()),
    ),
  }),
);
const collapsible = computed(
  () => !props.error && (props.loading || shownCategories.value.length > 0),
);
const cartLabel = computed(
  () => `Cart, ${props.cartCount} ${props.cartCount === 1 ? "item" : "items"}`,
);

function isMenu(category: StoreNavCategory): category is StoreNavMenu {
  return "links" in category;
}

function updateQuery(details: ComboboxInputValueChangeDetails) {
  query.value = details.inputValue;
}

function submitSearch(event: SubmitEvent) {
  suggestionsOpen.value = false;
  const form = event.currentTarget as HTMLFormElement;
  const trimmed = String(new FormData(form).get("q") ?? "").trim();
  if (trimmed) emit("search", trimmed);
}
</script>

<template>
  <header
    class="@container moderno-block-store-nav border-b border-border bg-background text-foreground"
  >
    <div
      class="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 @sm:px-6 @lg:gap-x-6 @lg:px-8"
    >
      <a
        :href="homeHref"
        class="flex h-9 shrink-0 items-center rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {{ brand }}
      </a>

      <template v-if="collapsible">
        <div v-if="loading" class="hidden min-w-0 @md:flex">
          <div role="status" aria-busy="true" class="relative flex items-center gap-4 px-3">
            <span class="sr-only">Loading categories…</span>
            <Skeleton
              v-for="key in placeholders"
              :key="key"
              aria-hidden="true"
              shape="text"
              class="w-16"
            />
          </div>
        </div>
        <nav v-else aria-label="Categories" class="hidden min-w-0 @md:flex">
          <ul class="m-0 flex list-none items-center gap-1 p-0">
            <li v-for="category in shownCategories" :key="category.id">
              <Menu.Root v-if="isMenu(category)">
                <Menu.Trigger
                  class="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                >
                  {{ category.label }}
                  <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item
                        v-for="link in category.links"
                        :key="link.id"
                        :value="link.id"
                        :disabled="link.disabled"
                        as-child
                      >
                        <a :href="link.disabled ? undefined : link.href" class="no-underline">
                          {{ link.label }}
                        </a>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              <a
                v-else
                :href="category.disabled ? undefined : category.href"
                :role="category.disabled ? 'link' : undefined"
                :aria-current="category.current ? 'page' : undefined"
                :aria-disabled="category.disabled || undefined"
                class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                {{ category.label }}
              </a>
            </li>
          </ul>
        </nav>
      </template>

      <Drawer.Root
        v-if="collapsible"
        v-model:open="drawerOpen"
        placement="right"
        lazy-mount
        unmount-on-exit
      >
        <Drawer.Trigger as-child>
          <Button type="button" variant="outline" class="ms-auto @md:hidden">Menu</Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Title>{{ brand }}</Drawer.Title>
              <Drawer.CloseTrigger aria-label="Close menu">×</Drawer.CloseTrigger>
              <div
                v-if="loading"
                role="status"
                aria-busy="true"
                class="relative flex items-center gap-4 px-3"
              >
                <span class="sr-only">Loading categories…</span>
                <Skeleton
                  v-for="key in placeholders"
                  :key="key"
                  aria-hidden="true"
                  shape="text"
                  class="w-16"
                />
              </div>
              <nav v-else aria-label="Categories">
                <ul class="m-0 grid list-none gap-1 p-0">
                  <li v-for="category in shownCategories" :key="category.id">
                    <template v-if="isMenu(category)">
                      <p class="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground">
                        {{ category.label }}
                      </p>
                      <ul class="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                        <li v-for="link in category.links" :key="link.id">
                          <a
                            :href="link.disabled ? undefined : link.href"
                            :role="link.disabled ? 'link' : undefined"
                            :aria-current="link.current ? 'page' : undefined"
                            :aria-disabled="link.disabled || undefined"
                            class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
                            @click="drawerOpen = false"
                          >
                            {{ link.label }}
                          </a>
                        </li>
                      </ul>
                    </template>
                    <a
                      v-else
                      :href="category.disabled ? undefined : category.href"
                      :role="category.disabled ? 'link' : undefined"
                      :aria-current="category.current ? 'page' : undefined"
                      :aria-disabled="category.disabled || undefined"
                      class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      @click="drawerOpen = false"
                    >
                      {{ category.label }}
                    </a>
                  </li>
                </ul>
              </nav>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <div class="flex w-full items-center gap-2 @lg:ms-auto @lg:w-auto @lg:max-w-sm @lg:flex-1">
        <form role="search" class="relative min-w-0 flex-1" @submit.prevent="submitSearch">
          <Combobox.Root
            name="q"
            :collection="collection"
            v-model:open="suggestionsOpen"
            allow-custom-value
            @input-value-change="updateQuery"
          >
            <Combobox.Label class="sr-only">Search products</Combobox.Label>
            <Combobox.Control>
              <Combobox.Input placeholder="Search products" />
            </Combobox.Control>
            <Portal>
              <Combobox.Positioner>
                <Combobox.Content>
                  <Combobox.Empty>No suggestions. Press Enter to search.</Combobox.Empty>
                  <Combobox.Item
                    v-for="suggestion in collection.items"
                    :key="suggestion.value"
                    :item="suggestion"
                    as-child
                  >
                    <a :href="suggestion.href" class="no-underline">
                      <Combobox.ItemText>{{ suggestion.label }}</Combobox.ItemText>
                    </a>
                  </Combobox.Item>
                </Combobox.Content>
              </Combobox.Positioner>
            </Portal>
          </Combobox.Root>
        </form>

        <Button
          type="button"
          variant="ghost"
          class="shrink-0"
          :aria-label="cartLabel"
          @click="emit('cart')"
        >
          Cart
          <Badge :variant="cartCount > 0 ? 'solid' : 'neutral'" size="sm">{{ cartCount }}</Badge>
        </Button>
      </div>
    </div>

    <div v-if="error" class="px-4 pb-4 @sm:px-6 @lg:px-8">
      <Alert.Root variant="error" size="sm">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Search and your cart still work.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" @click="emit('retry')">
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    </div>
  </header>
</template>
