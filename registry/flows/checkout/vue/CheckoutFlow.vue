<script setup lang="ts">
import { computed, ref } from "vue";
import Cart from "@/components/screens/Cart.vue";
import Confirmation from "@/components/screens/Confirmation.vue";
import Payment from "@/components/screens/Payment.vue";
import Review from "@/components/screens/Review.vue";
import Shipping from "@/components/screens/Shipping.vue";

/**
 * CheckoutFlow — the example assembly for the `checkout` flow: cart →
 * shipping → payment → review → confirmation. Copy it with
 * `moderno add checkout-vue`; the five screens and their blocks arrive with it.
 * The screens stay presentational; this file is the one you rewrite.
 *
 * It owns what the screens do not: the `step`, the cart's `lines`, the
 * `shippingDetails` and `deliveryId` from shipping, the `cardEnding` from
 * payment, the placed `order` and the last submit's `errors`. Every price the
 * screens show is computed here from those numbers.
 *
 * Forward moves are the screens' own submits and buttons. Steps back are the
 * Back buttons, a Change on the review and the "Edit cart" link, which the flow
 * takes over on a plain click and leaves to the browser otherwise.
 */

type CheckoutStep = "cart" | "shipping" | "payment" | "review" | "confirmation";

/** A line in the cart, priced as a number so the flow can total it. */
interface CheckoutLine {
  id: string;
  name: string;
  /** The price of one unit. */
  unitPrice: number;
  quantity: number;
  options?: string;
  href?: string;
  image?: { src: string; alt: string };
}

/** A way the order can travel, priced as a number so the flow can total it. */
interface CheckoutDeliveryOption {
  id: string;
  label: string;
  description: string;
  price: number;
}

/** The order once it is placed: what `orderPlaced` hands up and the confirmation shows. */
interface CheckoutOrder {
  number: string;
  email: string;
  lines: CheckoutLine[];
  delivery?: CheckoutDeliveryOption;
  total: number;
}

const sampleLines: CheckoutLine[] = [
  {
    id: "stoneware-mug",
    name: "Stoneware mug",
    unitPrice: 28,
    quantity: 2,
    options: "Sage · 350 ml",
    href: "#",
  },
  {
    id: "serving-bowl",
    name: "Serving bowl",
    unitPrice: 46,
    quantity: 1,
    options: "Oat · Large",
    href: "#",
  },
  { id: "bud-vase", name: "Bud vase", unitPrice: 32, quantity: 1, options: "Charcoal", href: "#" },
];

const sampleDeliveryOptions: CheckoutDeliveryOption[] = [
  { id: "standard", label: "Standard", description: "4–10 business days", price: 6 },
  { id: "express", label: "Express", description: "2–5 business days", price: 16 },
];

/** Every field each form must carry, and what to say when one is empty. */
const requiredFields = {
  shipping: {
    email: "Enter an email for the receipt.",
    fullName: "Enter the name on the parcel.",
    address: "Enter the street address.",
    city: "Enter the city.",
    region: "Enter the state or province.",
    postalCode: "Enter the postal code.",
    country: "Enter the country.",
  },
  payment: {
    cardName: "Enter the name on the card.",
    cardNumber: "Enter the card number.",
    expiry: "Enter the expiry date.",
    cvc: "Enter the security code.",
  },
};

const props = withDefaults(
  defineProps<{
    /** Which screen the flow opens on — in a real app, whatever the route says. */
    initialStep?: CheckoutStep;
    /** The lines in the cart when the flow opens. Defaults to a sample cart. */
    initialLines?: CheckoutLine[];
    /** The ways the order can travel. Defaults to standard and express. */
    deliveryOptions?: CheckoutDeliveryOption[];
    /** How an amount reads on screen. The default prints whole euros, like `€134`. */
    formatPrice?: (amount: number) => string;
    /** The URL each step lives at. Give your router's paths; the default is a fragment per step. */
    hrefFor?: (step: CheckoutStep) => string;
    /** Where the wordmark points, on every screen. */
    homeHref?: string;
    /** Where "Continue shopping" points in the cart's masthead. */
    shopHref?: string;
    /** Where "Need help?" points on shipping. */
    helpHref?: string;
    /** Where "Your orders" points on the confirmation. */
    ordersHref?: string;
    /** Where the privacy link points, on every screen. */
    privacyHref?: string;
    /** Where the terms link points, on every screen. */
    termsHref?: string;
  }>(),
  {
    initialStep: "cart",
    initialLines: undefined,
    deliveryOptions: undefined,
    formatPrice: undefined,
    hrefFor: undefined,
    homeHref: "#",
    shopHref: "#",
    helpHref: "#",
    ordersHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `stepChange` follows every move, for your router; `orderPlaced` hands up the
 * order once "Place order" goes through; `continueShopping` follows the
 * confirmation's button.
 */
const emit = defineEmits<{
  stepChange: [step: CheckoutStep];
  orderPlaced: [order: CheckoutOrder];
  continueShopping: [];
}>();

function priceText(amount: number): string {
  return props.formatPrice ? props.formatPrice(amount) : `€${amount}`;
}

function urlFor(step: CheckoutStep): string {
  return props.hrefFor ? props.hrefFor(step) : `#${step}`;
}

/** The messages for the fields the form left empty, or `undefined` when none are. */
function emptyFields(
  form: FormData,
  messages: Record<string, string>,
): Record<string, string> | undefined {
  const empty = Object.entries(messages).filter(
    ([name]) => String(form.get(name) ?? "").trim() === "",
  );
  return empty.length > 0 ? Object.fromEntries(empty) : undefined;
}

/** The lines and totals a screen shows, priced from the numbers the flow holds. */
function priceOrder(lines: CheckoutLine[], delivery?: CheckoutDeliveryOption) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const total = subtotal + (delivery?.price ?? 0);
  return {
    items: lines.map((line) => ({
      id: line.id,
      name: line.name,
      price: priceText(line.unitPrice * line.quantity),
      quantity: line.quantity,
      options: line.options,
      href: line.href,
      image: line.image,
    })),
    subtotal: priceText(subtotal),
    totals: [
      { label: "Subtotal", amount: priceText(subtotal) },
      ...(delivery ? [{ label: "Shipping", amount: priceText(delivery.price) }] : []),
    ],
    total,
    totalText: priceText(total),
  };
}

const deliveryOptions = computed(() => props.deliveryOptions ?? sampleDeliveryOptions);
const step = ref<CheckoutStep>(props.initialStep);
const lines = ref<CheckoutLine[]>(props.initialLines ?? sampleLines);
const shippingDetails = ref<Record<string, string>>({});
const deliveryId = ref(deliveryOptions.value[0]?.id ?? "");
const cardEnding = ref("");
const order = ref<CheckoutOrder | undefined>(undefined);
const errors = ref<Record<string, string> | undefined>(undefined);

const delivery = computed(() =>
  deliveryOptions.value.find((option) => option.id === deliveryId.value),
);
const cart = computed(() => priceOrder(lines.value));
const priced = computed(() => priceOrder(lines.value, delivery.value));
const placed = computed(() =>
  priceOrder(order.value?.lines ?? lines.value, order.value?.delivery ?? delivery.value),
);
const shownDeliveryOptions = computed(() =>
  deliveryOptions.value.map((option) => ({ ...option, price: priceText(option.price) })),
);

const details = computed(() => {
  const saved = shippingDetails.value;
  return [
    { id: "contact", term: "Contact", value: saved.email ?? "", action: "Change" },
    {
      id: "address",
      term: "Ship to",
      value: [
        saved.fullName,
        saved.address,
        saved.city,
        saved.region,
        saved.postalCode,
        saved.country,
      ]
        .filter(Boolean)
        .join(", "),
      action: "Change",
    },
    {
      id: "delivery",
      term: "Delivery",
      value: delivery.value ? `${delivery.value.label}, ${delivery.value.description}` : "",
      action: "Change",
    },
    {
      id: "payment",
      term: "Payment",
      value: cardEnding.value ? `Card ending in ${cardEnding.value}` : "",
      action: "Change",
    },
  ];
});

const placedDelivery = computed(() =>
  order.value?.delivery
    ? `${order.value.delivery.label}, ${order.value.delivery.description}`
    : undefined,
);

/** A move, and the one place the last submit's errors are dropped. */
function go(next: CheckoutStep) {
  step.value = next;
  errors.value = undefined;
  emit("stepChange", next);
}

function changeQuantity(id: string, quantity: number) {
  lines.value = lines.value.map((line) => (line.id === id ? { ...line, quantity } : line));
}

function removeLine(id: string) {
  lines.value = lines.value.filter((line) => line.id !== id);
}

/** Shipping's submit. Replace the check with your request; keep the move. */
function saveAddress(event: Event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget as HTMLFormElement);
  const empty = emptyFields(form, requiredFields.shipping);
  if (empty) {
    errors.value = empty;
    return;
  }
  shippingDetails.value = Object.fromEntries(
    Object.keys(requiredFields.shipping).map((name) => [name, String(form.get(name)).trim()]),
  );
  deliveryId.value = String(form.get("delivery") ?? deliveryId.value);
  go("payment");
}

/** Payment's submit. Only the last four digits are kept, for the review. */
function saveCard(event: Event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget as HTMLFormElement);
  const empty = emptyFields(form, requiredFields.payment);
  if (empty) {
    errors.value = empty;
    return;
  }
  cardEnding.value = String(form.get("cardNumber")).replace(/\D/g, "").slice(-4);
  go("review");
}

/** The review's "Change": the payment row goes to payment, the rest to shipping. */
function edit(id: string) {
  go(id === "payment" ? "payment" : "shipping");
}

/** The review's "Place order". The number stands in for your server's reference. */
function placeOrder() {
  const next: CheckoutOrder = {
    number: "#MD-10482",
    email: shippingDetails.value.email ?? "",
    lines: lines.value,
    delivery: delivery.value,
    total: priced.value.total,
  };
  order.value = next;
  lines.value = [];
  emit("orderPlaced", next);
  go("confirmation");
}

function continueShopping() {
  order.value = undefined;
  emit("continueShopping");
  go("cart");
}

/**
 * A link a screen drew was clicked. "Edit cart" is the flow's own, so a plain
 * left click moves to the cart; a modified click and every other link are the
 * browser's.
 */
function navigate(destination: string, event: MouseEvent) {
  if (destination !== "cart" || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  go("cart");
}
</script>

<template>
  <div class="moderno-flow-checkout">
    <Cart
      v-if="step === 'cart'"
      :items="cart.items"
      :subtotal="cart.subtotal"
      :home-href="homeHref"
      :shop-href="shopHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @quantity-change="changeQuantity"
      @remove="removeLine"
      @checkout="go('shipping')"
    />
    <Shipping
      v-else-if="step === 'shipping'"
      :delivery-options="shownDeliveryOptions"
      :items="cart.items"
      :totals="cart.totals"
      :total="cart.totalText"
      :field-errors="errors"
      :home-href="homeHref"
      :help-href="helpHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="saveAddress"
      @back="go('cart')"
    />
    <Payment
      v-else-if="step === 'payment'"
      description="Nothing is charged until you place the order on the next step."
      :items="priced.items"
      :totals="priced.totals"
      :total="priced.totalText"
      :errors="errors"
      :home-href="homeHref"
      :cart-href="urlFor('cart')"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="saveCard"
      @back="go('shipping')"
      @navigate="navigate"
    />
    <Review
      v-else-if="step === 'review'"
      :details="details"
      :items="priced.items"
      :totals="priced.totals"
      :total="priced.totalText"
      :home-href="homeHref"
      :cart-href="urlFor('cart')"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @confirm="placeOrder"
      @back="go('payment')"
      @edit="edit"
      @navigate="navigate"
    />
    <Confirmation
      v-else
      :order-number="order?.number"
      :delivery="placedDelivery"
      :email="order?.email"
      :items="placed.items"
      :totals="placed.totals"
      :total="placed.totalText"
      :home-href="homeHref"
      :orders-href="ordersHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @continue="continueShopping"
    />
  </div>
</template>
