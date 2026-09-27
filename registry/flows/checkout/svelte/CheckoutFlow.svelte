<script lang="ts">
  /**
   * CheckoutFlow — the example assembly for the `checkout` flow: cart →
   * shipping → payment → review → confirmation. Copy it with
   * `moderno add checkout-svelte`; the five screens and their blocks arrive
   * with it. The screens stay presentational; this file is the one you rewrite.
   *
   * It owns what the screens do not: the `step`, the cart's `lines`, the
   * `shippingDetails` and `deliveryId` from shipping, the `cardEnding` from
   * payment, the placed `order` and the last submit's `errors`. Every price the
   * screens show is computed here from those numbers.
   *
   * Forward moves are the screens' own submits and buttons. Steps back are the
   * Back buttons, a Change on the review and the "Edit cart" link, which the
   * flow takes over on a plain click and leaves to the browser otherwise.
   */
  import { untrack } from "svelte";
  import Cart from "@/components/screens/Cart.svelte";
  import Confirmation from "@/components/screens/Confirmation.svelte";
  import Payment from "@/components/screens/Payment.svelte";
  import Review from "@/components/screens/Review.svelte";
  import Shipping from "@/components/screens/Shipping.svelte";

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

  /** The order once it is placed: what `onorderplaced` hands up and the confirmation shows. */
  interface CheckoutOrder {
    number: string;
    email: string;
    lines: CheckoutLine[];
    delivery?: CheckoutDeliveryOption;
    total: number;
  }

  interface Props {
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
    /** The flow moved: mirror it in the URL so a reload and the back button land where the shopper is. */
    onstepchange?: (step: CheckoutStep) => void;
    /** "Place order" went through on the review. Send the order to your server here. */
    onorderplaced?: (order: CheckoutOrder) => void;
    /** "Continue shopping" was pressed on the confirmation. */
    oncontinueshopping?: () => void;
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
    {
      id: "bud-vase",
      name: "Bud vase",
      unitPrice: 32,
      quantity: 1,
      options: "Charcoal",
      href: "#",
    },
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

  let {
    initialStep = "cart",
    initialLines = sampleLines,
    deliveryOptions = sampleDeliveryOptions,
    formatPrice = (amount: number) => `€${amount}`,
    hrefFor = (step: CheckoutStep) => `#${step}`,
    onstepchange,
    onorderplaced,
    oncontinueshopping,
    homeHref = "#",
    shopHref = "#",
    helpHref = "#",
    ordersHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

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
        price: formatPrice(line.unitPrice * line.quantity),
        quantity: line.quantity,
        options: line.options,
        href: line.href,
        image: line.image,
      })),
      subtotal: formatPrice(subtotal),
      totals: [
        { label: "Subtotal", amount: formatPrice(subtotal) },
        ...(delivery ? [{ label: "Shipping", amount: formatPrice(delivery.price) }] : []),
      ],
      total,
      totalText: formatPrice(total),
    };
  }

  let step = $state<CheckoutStep>(untrack(() => initialStep));
  let lines = $state<CheckoutLine[]>(untrack(() => initialLines));
  let shippingDetails = $state<Record<string, string>>({});
  let deliveryId = $state(untrack(() => deliveryOptions[0]?.id ?? ""));
  let cardEnding = $state("");
  let order = $state<CheckoutOrder | undefined>(undefined);
  let errors = $state<Record<string, string> | undefined>(undefined);

  const delivery = $derived(deliveryOptions.find((option) => option.id === deliveryId));
  const cart = $derived(priceOrder(lines));
  const priced = $derived(priceOrder(lines, delivery));
  const placed = $derived(priceOrder(order?.lines ?? lines, order?.delivery ?? delivery));
  const shownDeliveryOptions = $derived(
    deliveryOptions.map((option) => ({ ...option, price: formatPrice(option.price) })),
  );

  const details = $derived([
    { id: "contact", term: "Contact", value: shippingDetails.email ?? "", action: "Change" },
    {
      id: "address",
      term: "Ship to",
      value: [
        shippingDetails.fullName,
        shippingDetails.address,
        shippingDetails.city,
        shippingDetails.region,
        shippingDetails.postalCode,
        shippingDetails.country,
      ]
        .filter(Boolean)
        .join(", "),
      action: "Change",
    },
    {
      id: "delivery",
      term: "Delivery",
      value: delivery ? `${delivery.label}, ${delivery.description}` : "",
      action: "Change",
    },
    {
      id: "payment",
      term: "Payment",
      value: cardEnding ? `Card ending in ${cardEnding}` : "",
      action: "Change",
    },
  ]);

  /** A move, and the one place the last submit's errors are dropped. */
  function go(next: CheckoutStep) {
    step = next;
    errors = undefined;
    onstepchange?.(next);
  }

  function changeQuantity(id: string, quantity: number) {
    lines = lines.map((line) => (line.id === id ? { ...line, quantity } : line));
  }

  function removeLine(id: string) {
    lines = lines.filter((line) => line.id !== id);
  }

  /** Shipping's submit. Replace the check with your request; keep the move. */
  function saveAddress(event: SubmitEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const empty = emptyFields(form, requiredFields.shipping);
    if (empty) {
      errors = empty;
      return;
    }
    shippingDetails = Object.fromEntries(
      Object.keys(requiredFields.shipping).map((name) => [name, String(form.get(name)).trim()]),
    );
    deliveryId = String(form.get("delivery") ?? deliveryId);
    go("payment");
  }

  /** Payment's submit. Only the last four digits are kept, for the review. */
  function saveCard(event: SubmitEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const empty = emptyFields(form, requiredFields.payment);
    if (empty) {
      errors = empty;
      return;
    }
    cardEnding = String(form.get("cardNumber")).replace(/\D/g, "").slice(-4);
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
      email: shippingDetails.email ?? "",
      lines,
      delivery,
      total: priced.total,
    };
    order = next;
    lines = [];
    onorderplaced?.(next);
    go("confirmation");
  }

  function continueShopping() {
    order = undefined;
    oncontinueshopping?.();
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

<div class="moderno-flow-checkout">
  {#if step === "cart"}
    <Cart
      items={cart.items}
      subtotal={cart.subtotal}
      onquantitychange={changeQuantity}
      onremove={removeLine}
      oncheckout={() => go("shipping")}
      {homeHref}
      {shopHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "shipping"}
    <Shipping
      deliveryOptions={shownDeliveryOptions}
      items={cart.items}
      totals={cart.totals}
      total={cart.totalText}
      fieldErrors={errors}
      onsubmit={saveAddress}
      onback={() => go("cart")}
      {homeHref}
      {helpHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "payment"}
    <Payment
      description="Nothing is charged until you place the order on the next step."
      items={priced.items}
      totals={priced.totals}
      total={priced.totalText}
      {errors}
      onsubmit={saveCard}
      onback={() => go("shipping")}
      onnavigate={navigate}
      {homeHref}
      cartHref={hrefFor("cart")}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "review"}
    <Review
      {details}
      items={priced.items}
      totals={priced.totals}
      total={priced.totalText}
      onconfirm={placeOrder}
      onback={() => go("payment")}
      onedit={edit}
      onnavigate={navigate}
      {homeHref}
      cartHref={hrefFor("cart")}
      {privacyHref}
      {termsHref}
    />
  {:else}
    <Confirmation
      orderNumber={order?.number}
      delivery={order?.delivery
        ? `${order.delivery.label}, ${order.delivery.description}`
        : undefined}
      email={order?.email}
      items={placed.items}
      totals={placed.totals}
      total={placed.totalText}
      oncontinue={continueShopping}
      {homeHref}
      {ordersHref}
      {privacyHref}
      {termsHref}
    />
  {/if}
</div>
