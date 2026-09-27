<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Pagination, Skeleton } from "@moderno-ui/vue";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductSummary {
  id: string;
  name: string;
  price: string;
  compareAtPrice?: string;
  badge?: string;
  href?: string;
  image?: ProductImage;
}

const sampleProducts: ProductSummary[] = [
  {
    id: "stoneware-mug",
    name: "Stoneware mug",
    price: "€28",
    compareAtPrice: "€35",
    badge: "Sale",
    href: "#",
  },
  { id: "serving-bowl", name: "Serving bowl", price: "€46", href: "#" },
  { id: "bud-vase", name: "Bud vase", price: "€32", badge: "New", href: "#" },
  { id: "dinner-plate", name: "Dinner plate", price: "€24", href: "#" },
  { id: "espresso-cup", name: "Espresso cup", price: "€18", href: "#" },
  { id: "pasta-bowl", name: "Pasta bowl", price: "€30", href: "#" },
  { id: "tall-vase", name: "Tall vase", price: "€54", href: "#" },
  {
    id: "side-plate",
    name: "Side plate",
    price: "€16",
    compareAtPrice: "€19",
    badge: "Sale",
    href: "#",
  },
  { id: "tea-mug", name: "Tea mug", price: "€26", href: "#" },
  { id: "salad-bowl", name: "Salad bowl", price: "€58", href: "#" },
  { id: "stem-vase", name: "Stem vase", price: "€38", badge: "New", href: "#" },
  { id: "serving-platter", name: "Serving platter", price: "€64" },
];

const sampleTotal = 48;

const props = withDefaults(
  defineProps<{
    heading?: string;
    description?: string;
    products?: ProductSummary[];
    total?: number;
    pageSize?: number;
    page?: number;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "The collection",
    description: "Stoneware, glass and linen for the table, made in small batches.",
    products: undefined,
    total: undefined,
    pageSize: 12,
    page: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  pageChange: [page: number];
  retry: [];
}>();

const shownProducts = computed(() => props.products ?? sampleProducts);
const count = computed(
  () => props.total ?? (props.products === undefined ? sampleTotal : props.products.length),
);
const placeholders = computed(() => Array.from({ length: props.pageSize }, (_, index) => index));
const disabledAttrs = computed(() => (props.disabled ? { disabled: true } : {}));
</script>

<template>
  <section class="@container moderno-block-product-list text-foreground">
    <div class="grid gap-10 px-4 py-12 @lg:py-16">
      <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
        <div class="grid max-w-md gap-3">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
          <p v-if="description" class="text-body text-muted-foreground">{{ description }}</p>
        </div>
        <p
          v-if="!error && !loading && shownProducts.length > 0"
          class="shrink-0 text-ui-md text-muted-foreground tabular-nums"
        >
          {{ count === 1 ? "1 product" : `${count} products` }}
        </p>
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
        class="relative grid grid-cols-2 gap-x-4 gap-y-8 @md:grid-cols-3 @lg:grid-cols-4 @lg:gap-x-6"
      >
        <span class="sr-only">Loading the products…</span>
        <div
          v-for="key in placeholders"
          :key="key"
          aria-hidden="true"
          class="grid content-start gap-3"
        >
          <Skeleton shape="rect" class="aspect-square h-auto w-full rounded-lg" />
          <Skeleton shape="text" class="w-3/4" />
          <Skeleton shape="text" class="w-1/3" />
        </div>
      </div>
      <p
        v-else-if="shownProducts.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No products match yet.
      </p>
      <ul
        v-else
        class="grid grid-cols-2 gap-x-4 gap-y-8 @md:grid-cols-3 @lg:grid-cols-4 @lg:gap-x-6"
      >
        <li v-for="product in shownProducts" :key="product.id" class="grid content-start gap-3">
          <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              v-if="product.image"
              :src="product.image.src"
              :alt="product.image.alt"
              class="absolute inset-0 size-full object-cover"
            />
            <Badge v-if="product.badge" variant="solid" size="sm" class="absolute start-2 top-2">{{
              product.badge
            }}</Badge>
          </div>
          <div class="grid gap-1">
            <h3 class="text-body font-medium text-balance">
              <a
                v-if="product.href"
                class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                :href="disabled ? undefined : product.href"
                :role="disabled ? 'link' : undefined"
                :aria-disabled="disabled || undefined"
                >{{ product.name }}</a
              >
              <template v-else>{{ product.name }}</template>
            </h3>
            <p class="relative flex flex-wrap items-baseline gap-x-2 text-ui-md tabular-nums">
              <span>{{ product.price }}</span>
              <s v-if="product.compareAtPrice" class="text-muted-foreground"
                ><span class="sr-only">Was</span> {{ product.compareAtPrice }}</s
              >
            </p>
          </div>
        </li>
      </ul>

      <Pagination.Root
        v-if="!error && shownProducts.length > 0 && count > pageSize"
        class="justify-self-center"
        :count="count"
        :page-size="pageSize"
        :page="page"
        @page-change="(details: { page: number }) => emit('pageChange', details.page)"
      >
        <Pagination.PrevTrigger v-bind="disabledAttrs">‹</Pagination.PrevTrigger>
        <Pagination.Context v-slot="{ pages }">
          <template v-for="(item, index) in pages" :key="index">
            <Pagination.Item v-if="item.type === 'page'" v-bind="{ ...item, ...disabledAttrs }">{{
              item.value
            }}</Pagination.Item>
            <Pagination.Ellipsis v-else :index="index">…</Pagination.Ellipsis>
          </template>
        </Pagination.Context>
        <Pagination.NextTrigger v-bind="disabledAttrs">›</Pagination.NextTrigger>
      </Pagination.Root>
    </div>
  </section>
</template>
