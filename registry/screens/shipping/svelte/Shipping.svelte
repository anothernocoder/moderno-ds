<!--
  Shipping — the full-viewport checkout step where a shopper says where the
  order goes: an email for the receipt, the shipping address and a delivery
  method, beside the order they are paying for. Copy it into your project with
  `moderno add shipping-svelte`; the two blocks it composes arrive with it, and
  every file is yours from that moment.

  Presentational. The screen owns the viewport and nothing else: no
  request, no router, no cart. It renders the order and the states it is
  handed and reports what the shopper did — `onsubmit` with the native form
  event, `onback` for "Back to cart", `onretry` inside the order's error, and
  `onnavigate` for every link it draws itself. Saving the address and pricing
  the order stay in the page that mounts this.

  Links carry an `href` and call `onnavigate(destination, event)` on top: a
  client router can `preventDefault()` — after reading `metaKey` to leave a
  ctrl/cmd-click to the browser — while the markup still works without
  JavaScript.

  The root is a `<div>`, not a `<main>`: most app shells already provide the
  `main` landmark. If your route has none, make this element your `<main>`.

  Responsive to its container, not the viewport (ADR-0005). Full-viewport
  is a *height* — `min-h-dvh` — and every width decision is read off the
  screen's own `@container`:

  - `@sm` (`--container-sm`, 24rem) — the masthead stops stacking: the
    wordmark shares a row with "Need help?".
  - `@md` (`--container-md`, 36rem) — the footer stops stacking.
  - `@lg` (`--container-lg`, 48rem) — the order summary moves beside the form.

  Each block keeps its own `@sm`/`@md`/`@lg` steps.

  States. `saving`, `saveError` and `fieldErrors` go to the form;
  `orderLoading`, `orderError` and an empty `items` go to the summary;
  `disabled` goes to both.

  Class strings are written out in full rather than shared through a variable:
  the docs compile the previews' Tailwind from `class` attributes, so a class
  assembled in JS would render here and vanish in the preview.
-->
<script lang="ts">
  import CheckoutForm from "@/components/blocks/CheckoutForm.svelte";
  import OrderSummary from "@/components/blocks/OrderSummary.svelte";

  type ShippingDestination = "home" | "help" | "privacy" | "terms";

  interface DeliveryOption {
    id: string;
    label: string;
    description: string;
    price: string;
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

  /** Priced in the same currency as the order summary's sample, so the two read as one order. */
  const sampleDeliveryOptions: DeliveryOption[] = [
    { id: "standard", label: "Standard", description: "4–10 business days", price: "€6" },
    { id: "express", label: "Express", description: "2–5 business days", price: "€16" },
  ];

  interface Props {
    /** The ways the order can travel. Defaults to a sample: standard and express. */
    deliveryOptions?: DeliveryOption[];
    /** The lines of the order. Leave it out for a sample order; `[]` is the empty state. */
    items?: OrderItem[];
    /** The rows above the total, like subtotal and taxes. */
    totals?: OrderTotal[];
    /** What the shopper pays, like `"€168"`. */
    total?: string;
    /** Saving the address failed. Shown as an alert at the top of the form. */
    saveError?: string;
    /** What is wrong with each field, keyed by its `name` (`email`, `postalCode`…). */
    fieldErrors?: Record<string, string>;
    /** The address is being saved: the form is inert and its button reads busy. */
    saving?: boolean;
    /** The order is on its way: placeholder lines in the summary. */
    orderLoading?: boolean;
    /** Loading the order failed: an alert with a retry replaces it. */
    orderError?: string;
    /** Nothing on the screen can be used right now. */
    disabled?: boolean;
    /** Native submit; call `event.preventDefault()` and read the fields from the form yourself. */
    onsubmit?: (event: SubmitEvent) => void;
    /** "Back to cart" was pressed. */
    onback?: () => void;
    /** "Try again" after `orderError`. */
    onretry?: () => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: ShippingDestination, event: MouseEvent) => void;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Need help?" points. */
    helpHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }

  let {
    deliveryOptions = sampleDeliveryOptions,
    items,
    totals,
    total,
    saveError,
    fieldErrors,
    saving = false,
    orderLoading = false,
    orderError,
    disabled = false,
    onsubmit,
    onback,
    onretry,
    onnavigate,
    homeHref = "#",
    helpHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();
</script>

<div class="@container moderno-screen-shipping min-h-dvh bg-background text-foreground">
  <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
    <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
      <a
        class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={homeHref}
        onclick={(event) => onnavigate?.("home", event)}
      >
        Moderno
      </a>
      <a
        class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={helpHref}
        onclick={(event) => onnavigate?.("help", event)}
      >
        Need help?
      </a>
    </header>

    <div class="mx-auto grid w-full max-w-6xl content-start gap-4 @lg:grid-cols-5 @lg:items-start @lg:gap-8">
      <div class="@lg:col-span-3">
        <CheckoutForm
          step="shipping"
          headingLevel={1}
          {deliveryOptions}
          error={saveError}
          errors={fieldErrors}
          loading={saving}
          {disabled}
          {onsubmit}
          {onback}
        />
      </div>
      <div class="@lg:col-span-2">
        <OrderSummary
          {items}
          {totals}
          {total}
          error={orderError}
          loading={orderLoading}
          {disabled}
          {onretry}
        />
      </div>
    </div>

    <footer class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
      <p>© Moderno</p>
      <nav class="flex gap-4" aria-label="Legal">
        <a
          class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={privacyHref}
          onclick={(event) => onnavigate?.("privacy", event)}
        >
          Privacy
        </a>
        <a
          class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={termsHref}
          onclick={(event) => onnavigate?.("terms", event)}
        >
          Terms
        </a>
      </nav>
    </footer>
  </div>
</div>
