import { Show } from "solid-js";
import { Alert, Button } from "@moderno-ui/solid";
import { DescriptionList, type DescriptionListItem } from "@/components/blocks/description-list";
import { OrderSummary, type OrderItem, type OrderTotal } from "@/components/blocks/order-summary";

export type ReviewDestination = "home" | "cart" | "privacy" | "terms";

const sampleDetails: DescriptionListItem[] = [
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

export interface ReviewProps {
  /** The page's `h1`. */
  heading?: string;
  /** The line under the heading; `""` hides it. */
  description?: string;
  /** What the shopper entered in the steps before: contact, address, delivery and payment. */
  details?: DescriptionListItem[];
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
  /** "Place order" was pressed. */
  onConfirm?: () => void;
  /** "Back to payment" was pressed. */
  onBack?: () => void;
  /** A detail's "Change" was pressed, with that detail's `id`. */
  onEdit?: (id: string) => void;
  /** "Try again" after `orderError`. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: ReviewDestination, event: MouseEvent) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Edit cart" points. */
  cartHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function Review(props: ReviewProps) {
  const description = () =>
    props.description ?? "Check the details and the total, then place your order.";
  const inert = () => Boolean(props.submitting) || Boolean(props.disabled);
  const orderReady = () => !props.loading && !props.orderError && props.items?.length !== 0;

  return (
    <div class="@container moderno-screen-review min-h-dvh bg-background text-foreground">
      <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={props.homeHref ?? "#"}
            onClick={(event) => props.onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <a
            class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={props.cartHref ?? "#"}
            onClick={(event) => props.onNavigate?.("cart", event)}
          >
            Edit cart
          </a>
        </header>

        <div class="mx-auto grid w-full max-w-5xl content-start gap-8">
          <div class="mx-auto grid max-w-md gap-3 px-4 pt-12 text-center">
            <h1 class="font-serif text-heading-sm text-balance @md:text-heading">
              {props.heading ?? "Review your order"}
            </h1>
            <Show when={description()}>
              <p class="text-body text-muted-foreground">{description()}</p>
            </Show>
          </div>

          <Show when={props.error}>
            <div class="mx-auto w-full max-w-lg px-4">
              <Alert.Root variant="error" size="sm">
                <Alert.Content>
                  <Alert.Title>{props.error}</Alert.Title>
                  <Alert.Description>
                    You have not been charged. Check the details and try again.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </div>
          </Show>

          <div class="grid gap-8 @lg:grid-cols-5 @lg:grid-rows-[auto_1fr] @lg:items-start">
            <div class="px-4 @lg:col-span-3 @lg:pt-12">
              <DescriptionList
                heading="Delivery and payment"
                description="Change anything before you place the order."
                items={props.details ?? sampleDetails}
                loading={props.loading}
                disabled={inert()}
                onAction={props.onEdit}
              />
            </div>

            <div class="@lg:col-span-2 @lg:col-start-4 @lg:row-span-2 @lg:row-start-1">
              <OrderSummary
                items={props.items}
                totals={props.totals}
                total={props.total}
                error={props.orderError}
                loading={props.loading}
                disabled={inert()}
                onRetry={props.onRetry}
              />
            </div>

            <div class="flex flex-col-reverse gap-3 px-4 @sm:flex-row @sm:items-center @sm:justify-between @lg:col-span-3">
              <Button
                type="button"
                variant="outline"
                disabled={inert()}
                onClick={() => props.onBack?.()}
              >
                Back to payment
              </Button>
              <Button
                type="button"
                disabled={inert() || !orderReady()}
                aria-busy={props.submitting}
                onClick={() => props.onConfirm?.()}
              >
                <Show when={props.submitting} fallback="Place order">
                  <span
                    aria-hidden="true"
                    class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  />
                  Placing order
                </Show>
              </Button>
            </div>
          </div>
        </div>

        <footer class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
          <p>© Moderno</p>
          <nav class="flex gap-4" aria-label="Legal">
            <a
              class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.privacyHref ?? "#"}
              onClick={(event) => props.onNavigate?.("privacy", event)}
            >
              Privacy
            </a>
            <a
              class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.termsHref ?? "#"}
              onClick={(event) => props.onNavigate?.("terms", event)}
            >
              Terms
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
