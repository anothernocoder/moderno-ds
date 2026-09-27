<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Alert, Button } from "@moderno-ui/svelte";
  import DescriptionList from "@/components/blocks/DescriptionList.svelte";
  import OrderSummary from "@/components/blocks/OrderSummary.svelte";

  type ReviewDestination = "home" | "cart" | "privacy" | "terms";
  type ReviewDetail = NonNullable<ComponentProps<typeof DescriptionList>["items"]>[number];

  interface Props {
    /** The page's `h1`. */
    heading?: string;
    /** The line under the heading; `""` hides it. */
    description?: string;
    /** What the shopper entered in the steps before: contact, address, delivery and payment. */
    details?: ReviewDetail[];
    /** The lines being ordered. Leave it out for the block's samples; `[]` is the empty state. */
    items?: ComponentProps<typeof OrderSummary>["items"];
    /** The rows above the total, like subtotal, shipping and taxes. */
    totals?: ComponentProps<typeof OrderSummary>["totals"];
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
    /** "Place order" was pressed. */
    onconfirm?: () => void;
    /** "Back to payment" was pressed. */
    onback?: () => void;
    /** A detail's "Change" was pressed, with that detail's `id`. */
    onedit?: (id: string) => void;
    /** "Try again" after `orderError`. */
    onretry?: () => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: ReviewDestination, event: MouseEvent) => void;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Edit cart" points. */
    cartHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
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

  let {
    heading = "Review your order",
    description = "Check the details and the total, then place your order.",
    details = sampleDetails,
    items,
    totals,
    total,
    error,
    submitting = false,
    loading = false,
    orderError,
    disabled = false,
    onconfirm,
    onback,
    onedit,
    onretry,
    onnavigate,
    homeHref = "#",
    cartHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

  const inert = $derived(submitting || disabled);
  const orderReady = $derived(!loading && !orderError && items?.length !== 0);
</script>

<div class="@container moderno-screen-review min-h-dvh bg-background text-foreground">
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
        href={cartHref}
        onclick={(event) => onnavigate?.("cart", event)}
      >
        Edit cart
      </a>
    </header>

    <div class="mx-auto grid w-full max-w-5xl content-start gap-8">
      <div class="mx-auto grid max-w-md gap-3 px-4 pt-12 text-center">
        <h1 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h1>
        {#if description}
          <p class="text-body text-muted-foreground">{description}</p>
        {/if}
      </div>

      {#if error}
        <div class="mx-auto w-full max-w-lg px-4">
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                You have not been charged. Check the details and try again.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </div>
      {/if}

      <div class="grid gap-8 @lg:grid-cols-5 @lg:grid-rows-[auto_1fr] @lg:items-start">
        <div class="px-4 @lg:col-span-3 @lg:pt-12">
          <DescriptionList
            heading="Delivery and payment"
            description="Change anything before you place the order."
            items={details}
            {loading}
            disabled={inert}
            onaction={onedit}
          />
        </div>

        <div class="@lg:col-span-2 @lg:col-start-4 @lg:row-span-2 @lg:row-start-1">
          <OrderSummary
            {items}
            {totals}
            {total}
            error={orderError}
            {loading}
            disabled={inert}
            {onretry}
          />
        </div>

        <div
          class="flex flex-col-reverse gap-3 px-4 @sm:flex-row @sm:items-center @sm:justify-between @lg:col-span-3"
        >
          <Button type="button" variant="outline" disabled={inert} onclick={onback}>
            Back to payment
          </Button>
          <Button
            type="button"
            disabled={inert || !orderReady}
            aria-busy={submitting}
            onclick={onconfirm}
          >
            {#if submitting}
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              ></span>
              Placing order
            {:else}
              Place order
            {/if}
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
