<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button } from "@moderno-ui/vue";
import DescriptionList from "@/components/blocks/DescriptionList.vue";
import OrderSummary from "@/components/blocks/OrderSummary.vue";

type ReviewDestination = "home" | "cart" | "privacy" | "terms";

interface ReviewDetail {
  id: string;
  term: string;
  value: string;
  action?: string;
}

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

const sampleDetails: ReviewDetail[] = [
  { id: "contact", term: "Contact", value: "margot.foster@example.com", action: "Change" },
  {
    id: "address",
    term: "Ship to",
    value: "Margot Foster, 18 Rue des Lilas, 75011 Paris, France",
    action: "Change",
  },
  { id: "delivery", term: "Delivery", value: "Standard, 4–10 business days", action: "Change" },
  { id: "payment", term: "Payment", value: "Visa ending in 4242", action: "Change" },
];

const props = withDefaults(
  defineProps<{
    /** The page's `h1`. */
    heading?: string;
    /** The line under the heading; `""` hides it. */
    description?: string;
    /** What the shopper entered in the steps before: contact, address, delivery and payment. */
    details?: ReviewDetail[];
    /** The lines being ordered. Leave it out for the block's samples; `[]` is the empty state. */
    items?: OrderItem[];
    /** The rows above the total, like subtotal, shipping and taxes. */
    totals?: OrderTotal[];
    /** The amount to pay as people read it, like `"€168"`. */
    total?: string;
    /** Placing the order failed: an alert under the heading. */
    error?: string;
    /** The order is being placed: the button spins and every control is inert. */
    submitting?: boolean;
    /** The order is on its way: placeholder lines replace the details and the summary. */
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
    heading: "Review your order",
    description: "Check the details and the total, then place your order.",
    details: undefined,
    items: undefined,
    totals: undefined,
    total: undefined,
    error: undefined,
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
 * `confirm` follows "Place order", `back` "Back to payment", `edit` a
 * detail's "Change" with that detail's `id`, and `retry` "Try again".
 * `navigate` names the destination a link the screen draws itself points at
 * and hands back the click event that did it, so the listener can
 * `preventDefault()`.
 */
const emit = defineEmits<{
  confirm: [];
  back: [];
  edit: [id: string];
  retry: [];
  navigate: [destination: ReviewDestination, event: MouseEvent];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const shownDetails = computed(() => props.details ?? sampleDetails);
const inert = computed(() => props.submitting || props.disabled);
const orderReady = computed(() => !props.loading && !props.orderError && props.items?.length !== 0);
</script>

<template>
  <div class="@container moderno-screen-review min-h-dvh bg-background text-foreground">
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

      <div class="mx-auto grid w-full max-w-5xl content-start gap-8">
        <div class="mx-auto grid max-w-md gap-3 px-4 pt-12 text-center">
          <h1 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h1>
          <p v-if="description" class="text-body text-muted-foreground">{{ description }}</p>
        </div>

        <div v-if="error" class="mx-auto w-full max-w-lg px-4">
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
              <Alert.Description>
                You have not been charged. Check the details and try again.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </div>

        <div class="grid gap-8 @lg:grid-cols-5 @lg:grid-rows-[auto_1fr] @lg:items-start">
          <div class="px-4 @lg:col-span-3 @lg:pt-12">
            <DescriptionList
              heading="Delivery and payment"
              description="Change anything before you place the order."
              :items="shownDetails"
              :loading="loading"
              :disabled="inert"
              @action="emit('edit', $event)"
            />
          </div>

          <div class="@lg:col-span-2 @lg:col-start-4 @lg:row-span-2 @lg:row-start-1">
            <OrderSummary
              :items="items"
              :totals="totals"
              :total="total"
              :error="orderError"
              :loading="loading"
              :disabled="inert"
              @retry="emit('retry')"
            />
          </div>

          <div
            class="flex flex-col-reverse gap-3 px-4 @sm:flex-row @sm:items-center @sm:justify-between @lg:col-span-3"
          >
            <Button type="button" variant="outline" :disabled="inert" @click="emit('back')">
              Back to payment
            </Button>
            <Button
              type="button"
              :disabled="inert || !orderReady"
              :aria-busy="submitting"
              @click="emit('confirm')"
            >
              <template v-if="submitting">
                <span
                  aria-hidden="true"
                  class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                Placing order
              </template>
              <template v-else>Place order</template>
            </Button>
          </div>
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
