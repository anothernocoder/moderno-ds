<script setup lang="ts">
import ShoppingCart from "@/components/blocks/ShoppingCart.vue";

type CartDestination = "home" | "shop" | "privacy" | "terms";

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  maxQuantity?: number;
  options?: string;
  href?: string;
  image?: { src: string; alt: string };
}

withDefaults(
  defineProps<{
    /** The page's heading, the shopping-cart block's heading raised to `h1`. */
    heading?: string;
    /** The lines in the cart. Leave it out for the block's samples; `[]` is the empty state. */
    items?: CartItem[];
    /** The subtotal as people read it, like `"€134"`. Leave it out and no subtotal row is shown. */
    subtotal?: string;
    /** A short line under the subtotal; `""` hides it. */
    note?: string;
    /** Loading the cart failed: an error alert with a retry replaces the lines and the summary. */
    error?: string;
    /** The cart is on its way: placeholder lines in a busy region. */
    loading?: boolean;
    /** The lines stay on screen and every control is inert. */
    disabled?: boolean;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Continue shopping" points. */
    shopHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    heading: "Your cart",
    items: undefined,
    subtotal: undefined,
    note: undefined,
    error: undefined,
    loading: false,
    disabled: false,
    homeHref: "#",
    shopHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `quantityChange` carries a line's `id` and its new whole-number quantity,
 * `remove` a line's `id`; `checkout` follows Checkout and `retry` "Try again".
 * `navigate` names the destination a link the screen draws itself points at and
 * hands back the click event that did it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  quantityChange: [id: string, quantity: number];
  remove: [id: string];
  checkout: [];
  retry: [];
  navigate: [destination: CartDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-cart min-h-dvh bg-background text-foreground">
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
          :href="shopHref"
          @click="emit('navigate', 'shop', $event)"
        >
          Continue shopping
        </a>
      </header>

      <div class="mx-auto w-full max-w-5xl">
        <ShoppingCart
          :heading-level="1"
          :heading="heading"
          :items="items"
          :subtotal="subtotal"
          :note="note"
          :error="error"
          :loading="loading"
          :disabled="disabled"
          @quantity-change="(id: string, quantity: number) => emit('quantityChange', id, quantity)"
          @remove="emit('remove', $event)"
          @checkout="emit('checkout')"
          @retry="emit('retry')"
        />
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
