<script setup lang="ts">
import { Badge, Button, Card } from "@moderno-ui/vue";
import OrderSummary from "@/components/blocks/OrderSummary.vue";

type ConfirmationDestination = "home" | "orders" | "privacy" | "terms";

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  options?: string;
  href?: string;
  image?: { src: string; alt: string };
}

interface OrderTotal {
  label: string;
  amount: string;
}

withDefaults(
  defineProps<{
    /** The page's `h1`. */
    heading?: string;
    /** The line under the heading; `""` hides it. */
    description?: string;
    /** The order's reference as people read it, like `"#MD-10482"`; `""` hides the row. */
    orderNumber?: string;
    /** When the order should arrive, like `"Tue, 6 October"`. Leave it out to hide the row. */
    delivery?: string;
    /** Where the receipt was sent. Leave it out to hide the row. */
    email?: string;
    /** The lines that were ordered. Leave it out for the block's samples; `[]` is the empty state. */
    items?: OrderItem[];
    /** The rows above the total, like subtotal, shipping and taxes. */
    totals?: OrderTotal[];
    /** The amount paid as people read it, like `"€168"`. */
    total?: string;
    /** The order is on its way: placeholder lines in a busy region replace the summary. */
    loading?: boolean;
    /** Loading the order failed: an error alert with a retry replaces the summary. */
    error?: string;
    /** Everything stays on screen and every control is inert. */
    disabled?: boolean;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Your orders" points. */
    ordersHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    heading: "Thank you for your order",
    description: "Your order is placed. We will email you again when it ships.",
    orderNumber: "#MD-10482",
    delivery: undefined,
    email: undefined,
    items: undefined,
    totals: undefined,
    total: undefined,
    loading: false,
    error: undefined,
    disabled: false,
    homeHref: "#",
    ordersHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `continue` follows "Continue shopping" and `retry` "Try again". `navigate`
 * names the destination a link the screen draws itself points at and hands
 * back the click event that did it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  continue: [];
  retry: [];
  navigate: [destination: ConfirmationDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-confirmation min-h-dvh bg-background text-foreground">
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
      <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
        <a
          class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="homeHref"
          @click="emit('navigate', 'home', $event)"
        >
          Moderno
        </a>
        <a
          class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="ordersHref"
          @click="emit('navigate', 'orders', $event)"
        >
          Your orders
        </a>
      </header>

      <div
        class="mx-auto grid w-full max-w-5xl content-start gap-8 @lg:grid-cols-5 @lg:items-start"
      >
        <div class="@lg:col-span-2 @lg:pt-16">
          <Card.Root>
            <Card.Content class="grid gap-6">
              <div class="grid justify-items-start gap-3">
                <Badge variant="success" dot>Order placed</Badge>
                <h1 class="font-serif text-heading-sm text-balance @md:text-heading">
                  {{ heading }}
                </h1>
                <p v-if="description" class="text-body text-muted-foreground text-pretty">
                  {{ description }}
                </p>
              </div>
              <dl
                v-if="orderNumber || delivery || email"
                class="grid gap-3 border-t border-border pt-6"
              >
                <div v-if="orderNumber" class="flex items-baseline justify-between gap-4">
                  <dt class="text-ui-md text-muted-foreground">Order number</dt>
                  <dd class="text-ui-md font-medium tabular-nums">{{ orderNumber }}</dd>
                </div>
                <div v-if="delivery" class="flex items-baseline justify-between gap-4">
                  <dt class="text-ui-md text-muted-foreground">Estimated delivery</dt>
                  <dd class="text-ui-md font-medium">{{ delivery }}</dd>
                </div>
                <div v-if="email" class="flex items-baseline justify-between gap-4">
                  <dt class="text-ui-md text-muted-foreground">Receipt sent to</dt>
                  <dd class="min-w-0 text-ui-md font-medium break-words">{{ email }}</dd>
                </div>
              </dl>
              <Button type="button" class="w-full" :disabled="disabled" @click="emit('continue')">
                Continue shopping
              </Button>
            </Card.Content>
          </Card.Root>
        </div>
        <div class="@lg:col-span-3">
          <OrderSummary
            :items="items"
            :totals="totals"
            :total="total"
            :error="error"
            :loading="loading"
            :disabled="disabled"
            @retry="emit('retry')"
          />
        </div>
      </div>

      <footer
        class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between"
      >
        <p>© Moderno</p>
        <nav class="flex gap-4" aria-label="Legal">
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="privacyHref"
            @click="emit('navigate', 'privacy', $event)"
          >
            Privacy
          </a>
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="termsHref"
            @click="emit('navigate', 'terms', $event)"
          >
            Terms
          </a>
        </nav>
      </footer>
    </div>
  </div>
</template>
