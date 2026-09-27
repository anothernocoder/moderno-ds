<script setup lang="ts">
import CheckoutForm from "@/components/blocks/CheckoutForm.vue";
import OrderSummary from "@/components/blocks/OrderSummary.vue";

type PaymentDestination = "home" | "cart" | "privacy" | "terms";

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
    /** The page's heading, the checkout-form block's heading raised to `h1`. */
    heading?: string;
    /** The line under the heading; `""` hides it. */
    description?: string;
    /** The lines being paid for. Leave it out for the block's samples; `[]` is the empty state. */
    items?: OrderItem[];
    /** The rows above the total, like subtotal, shipping and taxes. */
    totals?: OrderTotal[];
    /** The amount to pay as people read it, like `"€168"`. */
    total?: string;
    /** The payment did not go through: an alert above the card fields, which keep what was typed. */
    error?: string;
    /** A message under each card field that is wrong, keyed by the field's `name`. */
    errors?: Record<string, string>;
    /** The order is being placed: the button spins and every control is inert. */
    submitting?: boolean;
    /** The order is on its way: placeholder lines in a busy region replace the summary. */
    loading?: boolean;
    /** Loading the order failed: an error alert with a retry replaces the summary. */
    orderError?: string;
    /** Everything stays on screen and every control is inert. */
    disabled?: boolean;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Edit cart" points. */
    cartHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    heading: undefined,
    description: undefined,
    items: undefined,
    totals: undefined,
    total: undefined,
    error: undefined,
    errors: undefined,
    submitting: false,
    loading: false,
    orderError: undefined,
    disabled: false,
    homeHref: "#",
    cartHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `submit` follows "Place order" with the form's submit event (call
 * `preventDefault()` to keep the page where it is), `back` "Back to shipping"
 * and `retry` "Try again". `navigate` names the destination a link the screen
 * draws itself points at and hands back the click event that did it, so the
 * listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  back: [];
  retry: [];
  navigate: [destination: PaymentDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-payment min-h-dvh bg-background text-foreground">
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
          :href="cartHref"
          @click="emit('navigate', 'cart', $event)"
        >
          Edit cart
        </a>
      </header>

      <div
        class="mx-auto grid w-full max-w-5xl content-start gap-8 @lg:grid-cols-5 @lg:items-start"
      >
        <div class="@lg:col-span-3">
          <CheckoutForm
            step="payment"
            :heading-level="1"
            :heading="heading"
            :description="description"
            :error="error"
            :errors="errors"
            :loading="submitting"
            :disabled="disabled"
            @submit="emit('submit', $event)"
            @back="emit('back')"
          />
        </div>
        <div class="@lg:col-span-2">
          <OrderSummary
            :items="items"
            :totals="totals"
            :total="total"
            :error="orderError"
            :loading="loading"
            :disabled="disabled || submitting"
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
