import { createMemo, createSignal, Match, mergeProps, Switch } from "solid-js";
import { Cart } from "@/components/screens/cart";
import { Confirmation } from "@/components/screens/confirmation";
import { Payment } from "@/components/screens/payment";
import { Review } from "@/components/screens/review";
import { Shipping } from "@/components/screens/shipping";

/** One of the five screens the flow moves between, in the order it moves. */
export type CheckoutStep = "cart" | "shipping" | "payment" | "review" | "confirmation";

/** The flow, in order. */
export const CHECKOUT_STEPS: readonly CheckoutStep[] = [
  "cart",
  "shipping",
  "payment",
  "review",
  "confirmation",
];

/** A line in the cart, priced as a number so the flow can total it. */
export interface CheckoutLine {
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
export interface CheckoutDeliveryOption {
  id: string;
  label: string;
  description: string;
  price: number;
}

/** The order once it is placed: what `onOrderPlaced` hands up and the confirmation shows. */
export interface CheckoutOrder {
  number: string;
  email: string;
  lines: CheckoutLine[];
  delivery?: CheckoutDeliveryOption;
  total: number;
}

export interface CheckoutFlowProps {
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
  onStepChange?: (step: CheckoutStep) => void;
  /** "Place order" went through on the review. Send the order to your server here. */
  onOrderPlaced?: (order: CheckoutOrder) => void;
  /** "Continue shopping" was pressed on the confirmation. */
  onContinueShopping?: () => void;
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
function priceOrder(
  lines: CheckoutLine[],
  formatPrice: (amount: number) => string,
  delivery?: CheckoutDeliveryOption,
) {
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

/**
 * CheckoutFlow — the example assembly for the `checkout` flow: cart →
 * shipping → payment → review → confirmation. Copy it with
 * `moderno add checkout-solid`; the five screens and their blocks arrive with
 * it. The screens stay presentational; this file is the one you rewrite.
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
export function CheckoutFlow(props: CheckoutFlowProps) {
  const merged = mergeProps(
    {
      initialStep: "cart" as CheckoutStep,
      initialLines: sampleLines,
      deliveryOptions: sampleDeliveryOptions,
      formatPrice: (amount: number) => `€${amount}`,
      hrefFor: (step: CheckoutStep) => `#${step}`,
      homeHref: "#",
      shopHref: "#",
      helpHref: "#",
      ordersHref: "#",
      privacyHref: "#",
      termsHref: "#",
    },
    props,
  );

  const [step, setStep] = createSignal<CheckoutStep>(merged.initialStep);
  const [lines, setLines] = createSignal<CheckoutLine[]>(merged.initialLines);
  const [shippingDetails, setShippingDetails] = createSignal<Record<string, string>>({});
  const [deliveryId, setDeliveryId] = createSignal(merged.deliveryOptions[0]?.id ?? "");
  const [cardEnding, setCardEnding] = createSignal("");
  const [order, setOrder] = createSignal<CheckoutOrder | undefined>(undefined);
  const [errors, setErrors] = createSignal<Record<string, string> | undefined>(undefined);

  const delivery = createMemo(() =>
    merged.deliveryOptions.find((option) => option.id === deliveryId()),
  );
  const cart = createMemo(() => priceOrder(lines(), merged.formatPrice));
  const priced = createMemo(() => priceOrder(lines(), merged.formatPrice, delivery()));
  const placed = createMemo(() =>
    priceOrder(order()?.lines ?? lines(), merged.formatPrice, order()?.delivery ?? delivery()),
  );
  const shownDeliveryOptions = createMemo(() =>
    merged.deliveryOptions.map((option) => ({
      ...option,
      price: merged.formatPrice(option.price),
    })),
  );

  const details = createMemo(() => {
    const saved = shippingDetails();
    const chosen = delivery();
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
        value: chosen ? `${chosen.label}, ${chosen.description}` : "",
        action: "Change",
      },
      {
        id: "payment",
        term: "Payment",
        value: cardEnding() ? `Card ending in ${cardEnding()}` : "",
        action: "Change",
      },
    ];
  });

  const placedDelivery = () => {
    const chosen = order()?.delivery;
    return chosen ? `${chosen.label}, ${chosen.description}` : undefined;
  };

  /** A move, and the one place the last submit's errors are dropped. */
  const go = (next: CheckoutStep) => {
    setStep(next);
    setErrors(undefined);
    merged.onStepChange?.(next);
  };

  const changeQuantity = (id: string, quantity: number) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)));
  };

  const removeLine = (id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
  };

  /** Shipping's submit. Replace the check with your request; keep the move. */
  const saveAddress = (event: SubmitEvent) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const empty = emptyFields(form, requiredFields.shipping);
    if (empty) {
      setErrors(empty);
      return;
    }
    setShippingDetails(
      Object.fromEntries(
        Object.keys(requiredFields.shipping).map((name) => [name, String(form.get(name)).trim()]),
      ),
    );
    setDeliveryId(String(form.get("delivery") ?? deliveryId()));
    go("payment");
  };

  /** Payment's submit. Only the last four digits are kept, for the review. */
  const saveCard = (event: SubmitEvent) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const empty = emptyFields(form, requiredFields.payment);
    if (empty) {
      setErrors(empty);
      return;
    }
    setCardEnding(String(form.get("cardNumber")).replace(/\D/g, "").slice(-4));
    go("review");
  };

  /** The review's "Change": the payment row goes to payment, the rest to shipping. */
  const edit = (id: string) => {
    go(id === "payment" ? "payment" : "shipping");
  };

  /** The review's "Place order". The number stands in for your server's reference. */
  const placeOrder = () => {
    const next: CheckoutOrder = {
      number: "#MD-10482",
      email: shippingDetails().email ?? "",
      lines: lines(),
      delivery: delivery(),
      total: priced().total,
    };
    setOrder(next);
    setLines([]);
    merged.onOrderPlaced?.(next);
    go("confirmation");
  };

  const continueShopping = () => {
    setOrder(undefined);
    merged.onContinueShopping?.();
    go("cart");
  };

  /**
   * A link a screen drew was clicked. "Edit cart" is the flow's own, so a plain
   * left click moves to the cart; a modified click and every other link are the
   * browser's.
   */
  const navigate = (destination: string, event: MouseEvent) => {
    if (destination !== "cart" || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go("cart");
  };

  return (
    <div class="moderno-flow-checkout">
      <Switch>
        <Match when={step() === "cart"}>
          <Cart
            items={cart().items}
            subtotal={cart().subtotal}
            onQuantityChange={changeQuantity}
            onRemove={removeLine}
            onCheckout={() => go("shipping")}
            homeHref={merged.homeHref}
            shopHref={merged.shopHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "shipping"}>
          <Shipping
            deliveryOptions={shownDeliveryOptions()}
            items={cart().items}
            totals={cart().totals}
            total={cart().totalText}
            fieldErrors={errors()}
            onSubmit={saveAddress}
            onBack={() => go("cart")}
            homeHref={merged.homeHref}
            helpHref={merged.helpHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "payment"}>
          <Payment
            description="Nothing is charged until you place the order on the next step."
            items={priced().items}
            totals={priced().totals}
            total={priced().totalText}
            errors={errors()}
            onSubmit={saveCard}
            onBack={() => go("shipping")}
            onNavigate={navigate}
            homeHref={merged.homeHref}
            cartHref={merged.hrefFor("cart")}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "review"}>
          <Review
            details={details()}
            items={priced().items}
            totals={priced().totals}
            total={priced().totalText}
            onConfirm={placeOrder}
            onBack={() => go("payment")}
            onEdit={edit}
            onNavigate={navigate}
            homeHref={merged.homeHref}
            cartHref={merged.hrefFor("cart")}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "confirmation"}>
          <Confirmation
            orderNumber={order()?.number}
            delivery={placedDelivery()}
            email={order()?.email}
            items={placed().items}
            totals={placed().totals}
            total={placed().totalText}
            onContinue={continueShopping}
            homeHref={merged.homeHref}
            ordersHref={merged.ordersHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>
      </Switch>
    </div>
  );
}
