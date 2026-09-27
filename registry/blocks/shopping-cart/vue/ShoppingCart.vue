<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Card, NumberInput, Skeleton } from "@moderno-ui/vue";

interface CartItemImage {
  src: string;
  alt: string;
}

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  maxQuantity?: number;
  options?: string;
  href?: string;
  image?: CartItemImage;
}

const sampleItems: CartItem[] = [
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

const sampleSubtotal = "€134";

const props = withDefaults(
  defineProps<{
    heading?: string;
    items?: CartItem[];
    subtotal?: string;
    note?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "Shopping cart",
    items: undefined,
    subtotal: undefined,
    note: "Shipping and taxes are added at checkout.",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  quantityChange: [id: string, quantity: number];
  remove: [id: string];
  checkout: [];
  retry: [];
}>();

const shownItems = computed(() => props.items ?? sampleItems);
const shownSubtotal = computed(
  () => props.subtotal ?? (props.items === undefined ? sampleSubtotal : undefined),
);

function changeQuantity(id: string, quantity: number) {
  if (Number.isFinite(quantity)) emit("quantityChange", id, quantity);
}
</script>

<template>
  <section class="@container moderno-block-shopping-cart text-foreground">
    <div class="grid gap-8 px-4 py-12 @lg:py-16">
      <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>

      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Your cart is safe. Try again in a moment.</Alert.Description>
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
        <span class="sr-only">Loading your cart…</span>
        <div v-for="key in 3" :key="key" aria-hidden="true" class="flex gap-4 py-6 @sm:gap-6">
          <Skeleton shape="rect" class="size-20 shrink-0 rounded-lg @sm:size-24 @md:size-32" />
          <div class="grid flex-1 content-start gap-3">
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="rect" class="h-7 w-28" />
          </div>
        </div>
      </div>
      <p
        v-else-if="shownItems.length === 0"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        Your cart is empty.
      </p>
      <div v-else class="grid gap-8 @lg:grid-cols-3 @lg:items-start @lg:gap-10">
        <ul class="divide-y divide-border border-y border-border @lg:col-span-2">
          <li
            v-for="item in shownItems"
            :key="item.id"
            class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-4 py-6 @sm:gap-x-6"
          >
            <div
              class="relative size-20 overflow-hidden rounded-lg bg-muted @sm:row-span-2 @sm:size-24 @md:size-32"
            >
              <img
                v-if="item.image"
                :src="item.image.src"
                :alt="item.image.alt"
                class="absolute inset-0 size-full object-cover"
              />
            </div>
            <div class="grid min-w-0 content-start gap-1">
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
            <p class="text-end text-body font-medium tabular-nums">
              {{ item.price }}
            </p>
            <div
              class="col-span-3 flex items-center justify-between gap-3 @sm:col-span-2 @sm:col-start-2 @sm:justify-start"
            >
              <NumberInput.Root
                size="sm"
                class="w-28"
                :default-value="String(item.quantity)"
                :min="1"
                :max="item.maxQuantity ?? 99"
                :disabled="disabled"
                @value-change="changeQuantity(item.id, $event.valueAsNumber)"
              >
                <NumberInput.Label class="sr-only">Quantity, {{ item.name }}</NumberInput.Label>
                <NumberInput.Control>
                  <NumberInput.Input />
                  <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
                  <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
                </NumberInput.Control>
              </NumberInput.Root>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                :disabled="disabled"
                :aria-label="`Remove ${item.name}`"
                @click="emit('remove', item.id)"
              >
                Remove
              </Button>
            </div>
          </li>
        </ul>

        <Card.Root variant="muted">
          <Card.Header>
            <Card.Title>Order summary</Card.Title>
          </Card.Header>
          <Card.Content class="grid gap-3">
            <dl v-if="shownSubtotal" class="flex items-baseline justify-between gap-4">
              <dt class="text-ui-md text-muted-foreground">Subtotal</dt>
              <dd class="text-body-lg font-semibold tabular-nums">{{ shownSubtotal }}</dd>
            </dl>
            <p v-if="note" class="text-ui-sm text-muted-foreground">{{ note }}</p>
          </Card.Content>
          <Card.Footer>
            <Button type="button" class="w-full" :disabled="disabled" @click="emit('checkout')">
              Checkout
            </Button>
          </Card.Footer>
        </Card.Root>
      </div>
    </div>
  </section>
</template>
