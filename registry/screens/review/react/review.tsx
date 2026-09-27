import type { MouseEvent } from "react";
import { Alert, Button } from "@moderno-ui/react";
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
  onNavigate?: (destination: ReviewDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Edit cart" points. */
  cartHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function Review({
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
  onConfirm,
  onBack,
  onEdit,
  onRetry,
  onNavigate,
  homeHref = "#",
  cartHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: ReviewProps) {
  const inert = submitting || disabled;
  const orderReady = !loading && !orderError && items?.length !== 0;

  return (
    <div className="@container moderno-screen-review min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header className="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            className="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={homeHref}
            onClick={(event) => onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <a
            className="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={cartHref}
            onClick={(event) => onNavigate?.("cart", event)}
          >
            Edit cart
          </a>
        </header>

        <div className="mx-auto grid w-full max-w-5xl content-start gap-8">
          <div className="mx-auto grid max-w-md gap-3 px-4 pt-12 text-center">
            <h1 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h1>
            {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
          </div>

          {error ? (
            <div className="mx-auto w-full max-w-lg px-4">
              <Alert.Root variant="error" size="sm">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>
                    You have not been charged. Check the details and try again.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </div>
          ) : null}

          <div className="grid gap-8 @lg:grid-cols-5 @lg:grid-rows-[auto_1fr] @lg:items-start">
            <div className="px-4 @lg:col-span-3 @lg:pt-12">
              <DescriptionList
                heading="Delivery and payment"
                description="Change anything before you place the order."
                items={details}
                loading={loading}
                disabled={inert}
                onAction={onEdit}
              />
            </div>

            <div className="@lg:col-span-2 @lg:col-start-4 @lg:row-span-2 @lg:row-start-1">
              <OrderSummary
                items={items}
                totals={totals}
                total={total}
                error={orderError}
                loading={loading}
                disabled={inert}
                onRetry={onRetry}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 px-4 @sm:flex-row @sm:items-center @sm:justify-between @lg:col-span-3">
              <Button type="button" variant="outline" disabled={inert} onClick={onBack}>
                Back to payment
              </Button>
              <Button
                type="button"
                disabled={inert || !orderReady}
                aria-busy={submitting}
                onClick={onConfirm}
              >
                {submitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    />
                    Placing order
                  </>
                ) : (
                  "Place order"
                )}
              </Button>
            </div>
          </div>
        </div>

        <footer className="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
          <p>© Moderno</p>
          <nav className="flex gap-4" aria-label="Legal">
            <a
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={privacyHref}
              onClick={(event) => onNavigate?.("privacy", event)}
            >
              Privacy
            </a>
            <a
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={termsHref}
              onClick={(event) => onNavigate?.("terms", event)}
            >
              Terms
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
