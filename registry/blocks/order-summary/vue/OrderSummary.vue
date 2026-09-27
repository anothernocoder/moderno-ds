<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Card, Divider, Skeleton } from "@moderno-ui/vue";

interface OrderItemImage {
  src: string;
  alt: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  options?: string;
  href?: string;
  image?: OrderItemImage;
}

interface OrderTotal {
  label: string;
  amount: string;
}

const sampleItems: OrderItem[] = [
  {
    id: "stoneware-mug",
    name: "Stoneware mug",
    price: "€56",
    quantity: 2,
    options: "Sage · 350 ml",
    href: "#",
  },
  {
    id: "serving-bowl",
    name: "Serving bowl",
    price: "€46",
    quantity: 1,
    options: "Oat · Large",
    href: "#",
  },
  { id: "bud-vase", name: "Bud vase", price: "€32", quantity: 1, options: "Charcoal", href: "#" },
];

const sampleTotals: OrderTotal[] = [
  { label: "Subtotal", amount: "€134" },
  { label: "Shipping", amount: "€6" },
  { label: "Taxes", amount: "€28" },
];

const sampleTotal = "€168";

const props = withDefaults(
  defineProps<{
    heading?: string;
    items?: OrderItem[];
    totals?: OrderTotal[];
    total?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "Order summary",
    items: undefined,
    totals: undefined,
    total: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  retry: [];
}>();

const shownItems = computed(() => props.items ?? sampleItems);
const shownTotals = computed(() => props.totals ?? (props.items === undefined ? sampleTotals : []));
const shownTotal = computed(
  () => props.total ?? (props.items === undefined ? sampleTotal : undefined),
);
</script>

<template>
  <section class="@container moderno-block-order-summary text-foreground">
    <div class="grid gap-8 px-4 py-12 @lg:py-16">
      <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Your order has not changed. Try again in a moment.</Alert.Description>
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
        class="relative grid divide-y divide-border border-y border-border"
      >
        <span class="sr-only">Loading your order…</span>
        <div v-for="key in 3" :key="key" aria-hidden="true" class="flex gap-4 py-5 @sm:gap-6">
          <Skeleton shape="rect" class="size-16 shrink-0 rounded-lg @sm:size-20 @md:size-24" />
          <div class="grid flex-1 content-start gap-3">
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="w-1/3" />
          </div>
        </div>
      </div>
      <p
        v-else-if="shownItems.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        Your order is empty.
      </p>
      <div v-else class="grid gap-8 @lg:grid-cols-3 @lg:items-start @lg:gap-10">
        <ul class="divide-y divide-border border-y border-border @lg:col-span-2">
          <li
            v-for="item in shownItems"
            :key="item.id"
            class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 py-5 @sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] @sm:gap-x-6"
          >
            <div
              class="relative row-span-2 size-16 overflow-hidden rounded-lg bg-muted @sm:row-span-1 @sm:size-20 @md:size-24"
            >
              <img
                v-if="item.image"
                :src="item.image.src"
                :alt="item.image.alt"
                class="absolute inset-0 size-full object-cover"
              />
            </div>
            <div class="col-start-2 row-start-1 grid min-w-0 content-start gap-1 self-baseline">
              <h3 class="text-body font-medium text-balance">
                <a
                  v-if="item.href"
                  class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                  :href="disabled ? undefined : item.href"
                  :role="disabled ? 'link' : undefined"
                  :aria-disabled="disabled || undefined"
                  >{{ item.name }}</a
                >
                <template v-else>{{ item.name }}</template>
              </h3>
              <p v-if="item.options" class="text-ui-md text-muted-foreground">
                {{ item.options }}
              </p>
            </div>
            <p
              class="col-start-2 row-start-2 self-baseline text-ui-md text-muted-foreground tabular-nums @sm:col-start-3 @sm:row-start-1"
            >
              Qty {{ item.quantity }}
            </p>
            <p
              class="col-start-3 row-start-1 self-baseline text-end text-body font-medium tabular-nums @sm:col-start-4"
            >
              {{ item.price }}
            </p>
          </li>
        </ul>

        <Card.Root v-if="shownTotals.length > 0 || shownTotal" variant="muted">
          <Card.Content class="grid gap-4">
            <dl v-if="shownTotals.length > 0" class="grid gap-3">
              <div
                v-for="row in shownTotals"
                :key="row.label"
                class="flex items-baseline justify-between gap-4"
              >
                <dt class="text-ui-md text-muted-foreground">{{ row.label }}</dt>
                <dd class="text-ui-md tabular-nums">{{ row.amount }}</dd>
              </div>
            </dl>
            <Divider v-if="shownTotals.length > 0 && shownTotal" />
            <dl v-if="shownTotal" class="flex items-baseline justify-between gap-4">
              <dt class="text-body font-semibold">Total</dt>
              <dd class="text-body-lg font-semibold tabular-nums">{{ shownTotal }}</dd>
            </dl>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </section>
</template>
