<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  Drawer,
  Portal,
  Skeleton,
  Slider,
} from "@moderno-ui/vue";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterFacet {
  id: string;
  label: string;
  options: FilterOption[];
}

interface PriceFilter {
  min: number;
  max: number;
  step?: number;
  currency?: string;
}

interface CategoryFilters {
  options: Record<string, string[]>;
  price: [number, number] | null;
}

const props = withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    facets?: FilterFacet[];
    price?: PriceFilter | null;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "New arrivals",
    description: "Stoneware, porcelain and glass, made by hand in small batches.",
    facets: () => [
      {
        id: "category",
        label: "Category",
        options: [
          { value: "mugs", label: "Mugs", count: 12 },
          { value: "bowls", label: "Bowls", count: 9 },
          { value: "plates", label: "Plates", count: 7 },
          { value: "vases", label: "Vases", count: 4 },
        ],
      },
      {
        id: "colour",
        label: "Colour",
        options: [
          { value: "sage", label: "Sage", count: 10 },
          { value: "oat", label: "Oat", count: 8 },
          { value: "charcoal", label: "Charcoal", count: 5 },
          { value: "clay", label: "Clay", count: 3 },
        ],
      },
      {
        id: "material",
        label: "Material",
        options: [
          { value: "stoneware", label: "Stoneware", count: 14 },
          { value: "porcelain", label: "Porcelain", count: 11 },
          { value: "glass", label: "Glass", count: 7 },
        ],
      },
    ],
    price: () => ({ min: 0, max: 200, step: 10, currency: "EUR" }),
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  filtersChange: [filters: CategoryFilters];
  retry: [];
}>();

const placeholders = ["first", "second", "third"];

function formatPrice(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

const picked = ref<Record<string, string[]>>({});
const chosenPrice = ref<[number, number] | null>(null);
const drawerOpen = ref(false);
let movedPrice: [number, number] | null = null;

const priceRange = computed<[number, number] | null>(() =>
  props.price ? (chosenPrice.value ?? [props.price.min, props.price.max]) : null,
);
const activeCount = computed(
  () =>
    Object.values(picked.value).reduce((total, values) => total + values.length, 0) +
    (chosenPrice.value ? 1 : 0),
);
const sections = computed(() => [
  ...props.facets.map((facet) => ({ id: facet.id, label: facet.label, facet })),
  ...(props.price ? [{ id: "price", label: "Price", facet: undefined }] : []),
]);
const openSections = computed(() => sections.value.map((section) => section.id));

function priceText(details: { value: number }) {
  return formatPrice(details.value, props.price?.currency);
}

function isPicked(facetId: string, value: string) {
  return picked.value[facetId]?.includes(value) ?? false;
}

function report(options: Record<string, string[]>, range: [number, number] | null) {
  emit("filtersChange", { options, price: range });
}

function toggle(facetId: string, value: string, checked: boolean) {
  const current = picked.value[facetId] ?? [];
  const values = checked ? [...current, value] : current.filter((item) => item !== value);
  picked.value = { ...picked.value, [facetId]: values };
  report(picked.value, priceRange.value);
}

function movePrice(value: number[]) {
  const range: [number, number] = [value[0]!, value[1]!];
  const full = props.price !== null && range[0] <= props.price.min && range[1] >= props.price.max;
  movedPrice = range;
  chosenPrice.value = full ? null : range;
}

// The end event can fire before the new value renders, so it reports the last value that moved.
function settlePrice() {
  report(picked.value, movedPrice ?? priceRange.value);
  movedPrice = null;
}

function clearAll() {
  picked.value = {};
  chosenPrice.value = null;
  report({}, props.price ? [props.price.min, props.price.max] : null);
}
</script>

<template>
  <section class="@container moderno-block-category-filter text-foreground">
    <div class="px-4 py-12 @lg:py-16">
      <div
        class="grid gap-4 border-b border-border pb-6 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6"
      >
        <div class="grid gap-1">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
          <p v-if="description" class="text-body text-pretty text-muted-foreground">
            {{ description }}
          </p>
        </div>

        <Drawer.Root v-model:open="drawerOpen" placement="left" lazy-mount unmount-on-exit>
          <Drawer.Trigger as-child>
            <Button
              type="button"
              variant="outline"
              class="@sm:shrink-0 @md:hidden"
              :disabled="disabled"
            >
              {{ activeCount > 0 ? `Filters (${activeCount})` : "Filters" }}
            </Button>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Title>Filters</Drawer.Title>
                <Drawer.CloseTrigger aria-label="Close filters">
                  <span aria-hidden="true">×</span>
                </Drawer.CloseTrigger>
                <div class="flex-1">
                  <Alert.Root v-if="error" variant="error" size="sm">
                    <Alert.Content>
                      <Alert.Title>{{ error }}</Alert.Title>
                      <Alert.Description>
                        The products still show. Try again in a moment.
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
                  <div v-else-if="loading" role="status" aria-busy="true" class="grid gap-6 py-4">
                    <span class="sr-only">Loading filters…</span>
                    <div
                      v-for="key in placeholders"
                      :key="key"
                      aria-hidden="true"
                      class="grid gap-3"
                    >
                      <Skeleton shape="text" class="w-1/2" />
                      <Skeleton shape="text" class="w-3/4" />
                      <Skeleton shape="text" class="w-2/3" />
                    </div>
                  </div>
                  <p
                    v-else-if="sections.length === 0"
                    class="m-0 rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
                  >
                    No filters for this category.
                  </p>
                  <Accordion.Root v-else multiple :default-value="openSections">
                    <Accordion.Item
                      v-for="section in sections"
                      :key="section.id"
                      :value="section.id"
                    >
                      <h3 class="m-0">
                        <Accordion.ItemTrigger>
                          {{ section.label }}
                          <Accordion.ItemIndicator>
                            <svg
                              class="size-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </Accordion.ItemIndicator>
                        </Accordion.ItemTrigger>
                      </h3>
                      <Accordion.ItemContent>
                        <ul v-if="section.facet" class="m-0 grid list-none gap-3 px-1 pt-1">
                          <li v-for="option in section.facet.options" :key="option.value">
                            <Checkbox.Root
                              class="flex"
                              :checked="isPicked(section.id, option.value)"
                              :disabled="disabled"
                              @checked-change="
                                toggle(section.id, option.value, $event.checked === true)
                              "
                            >
                              <Checkbox.Control>
                                <Checkbox.Indicator>✓</Checkbox.Indicator>
                              </Checkbox.Control>
                              <Checkbox.Label>{{ option.label }}</Checkbox.Label>
                              <span
                                v-if="option.count !== undefined"
                                class="ms-auto text-ui-sm text-muted-foreground tabular-nums"
                              >
                                {{ option.count }}
                              </span>
                              <Checkbox.HiddenInput />
                            </Checkbox.Root>
                          </li>
                        </ul>
                        <Slider.Root
                          v-else-if="price && priceRange"
                          class="px-1 pt-1"
                          size="sm"
                          :min="price.min"
                          :max="price.max"
                          :step="price.step ?? 1"
                          :model-value="priceRange"
                          :disabled="disabled"
                          :get-aria-value-text="priceText"
                          @value-change="movePrice($event.value)"
                          @value-change-end="settlePrice"
                        >
                          <Slider.ValueText>
                            {{ formatPrice(priceRange[0], price.currency) }} –
                            {{ formatPrice(priceRange[1], price.currency) }}
                          </Slider.ValueText>
                          <Slider.Control>
                            <Slider.Track>
                              <Slider.Range />
                            </Slider.Track>
                            <Slider.Thumb :index="0" aria-label="Minimum price">
                              <Slider.HiddenInput />
                            </Slider.Thumb>
                            <Slider.Thumb :index="1" aria-label="Maximum price">
                              <Slider.HiddenInput />
                            </Slider.Thumb>
                          </Slider.Control>
                        </Slider.Root>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
                <div class="flex justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    :disabled="disabled || activeCount === 0"
                    @click="clearAll"
                  >
                    Clear all
                  </Button>
                  <Drawer.CloseTrigger as-child>
                    <Button type="button">Show results</Button>
                  </Drawer.CloseTrigger>
                </div>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </div>

      <div class="grid gap-8 pt-6 @md:grid-cols-[auto_minmax(0,1fr)] @lg:gap-10">
        <aside
          aria-label="Filters"
          class="hidden @md:grid @md:w-48 @md:content-start @md:gap-3 @lg:w-60"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-ui-md font-semibold">Filters</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              :disabled="disabled || activeCount === 0"
              @click="clearAll"
            >
              Clear all
            </Button>
          </div>
          <Alert.Root v-if="error" variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
              <Alert.Description>The products still show. Try again in a moment.</Alert.Description>
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
          <div v-else-if="loading" role="status" aria-busy="true" class="grid gap-6 py-4">
            <span class="sr-only">Loading filters…</span>
            <div v-for="key in placeholders" :key="key" aria-hidden="true" class="grid gap-3">
              <Skeleton shape="text" class="w-1/2" />
              <Skeleton shape="text" class="w-3/4" />
              <Skeleton shape="text" class="w-2/3" />
            </div>
          </div>
          <p
            v-else-if="sections.length === 0"
            class="m-0 rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
          >
            No filters for this category.
          </p>
          <Accordion.Root v-else multiple :default-value="openSections">
            <Accordion.Item v-for="section in sections" :key="section.id" :value="section.id">
              <h3 class="m-0">
                <Accordion.ItemTrigger>
                  {{ section.label }}
                  <Accordion.ItemIndicator>
                    <svg
                      class="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
              </h3>
              <Accordion.ItemContent>
                <ul v-if="section.facet" class="m-0 grid list-none gap-3 px-1 pt-1">
                  <li v-for="option in section.facet.options" :key="option.value">
                    <Checkbox.Root
                      class="flex"
                      :checked="isPicked(section.id, option.value)"
                      :disabled="disabled"
                      @checked-change="toggle(section.id, option.value, $event.checked === true)"
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator>✓</Checkbox.Indicator>
                      </Checkbox.Control>
                      <Checkbox.Label>{{ option.label }}</Checkbox.Label>
                      <span
                        v-if="option.count !== undefined"
                        class="ms-auto text-ui-sm text-muted-foreground tabular-nums"
                      >
                        {{ option.count }}
                      </span>
                      <Checkbox.HiddenInput />
                    </Checkbox.Root>
                  </li>
                </ul>
                <Slider.Root
                  v-else-if="price && priceRange"
                  class="px-1 pt-1"
                  size="sm"
                  :min="price.min"
                  :max="price.max"
                  :step="price.step ?? 1"
                  :model-value="priceRange"
                  :disabled="disabled"
                  :get-aria-value-text="priceText"
                  @value-change="movePrice($event.value)"
                  @value-change-end="settlePrice"
                >
                  <Slider.ValueText>
                    {{ formatPrice(priceRange[0], price.currency) }} –
                    {{ formatPrice(priceRange[1], price.currency) }}
                  </Slider.ValueText>
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb :index="0" aria-label="Minimum price">
                      <Slider.HiddenInput />
                    </Slider.Thumb>
                    <Slider.Thumb :index="1" aria-label="Maximum price">
                      <Slider.HiddenInput />
                    </Slider.Thumb>
                  </Slider.Control>
                </Slider.Root>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        </aside>
        <div class="min-w-0"><slot /></div>
      </div>
    </div>
  </section>
</template>
