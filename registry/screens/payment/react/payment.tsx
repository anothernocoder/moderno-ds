import type { FormEvent, MouseEvent } from "react";
import { CheckoutForm } from "@/components/blocks/checkout-form";
import { OrderSummary, type OrderItem, type OrderTotal } from "@/components/blocks/order-summary";

export type PaymentDestination = "home" | "cart" | "privacy" | "terms";

export interface PaymentProps {
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
  /** "Place order" was pressed. Call `preventDefault()` to keep the page where it is. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** "Back to shipping" was pressed. */
  onBack?: () => void;
  /** "Try again" after `orderError`. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: PaymentDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Edit cart" points. */
  cartHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function Payment({
  heading,
  description,
  items,
  totals,
  total,
  error,
  errors,
  submitting = false,
  loading = false,
  orderError,
  disabled = false,
  onSubmit,
  onBack,
  onRetry,
  onNavigate,
  homeHref = "#",
  cartHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: PaymentProps) {
  return (
    <div className="@container moderno-screen-payment min-h-dvh bg-background text-foreground">
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

        <div className="mx-auto grid w-full max-w-5xl content-start gap-8 @lg:grid-cols-5 @lg:items-start">
          <div className="@lg:col-span-3">
            <CheckoutForm
              step="payment"
              headingLevel={1}
              heading={heading}
              description={description}
              error={error}
              errors={errors}
              loading={submitting}
              disabled={disabled}
              onSubmit={onSubmit}
              onBack={onBack}
            />
          </div>
          <div className="@lg:col-span-2">
            <OrderSummary
              items={items}
              totals={totals}
              total={total}
              error={orderError}
              loading={loading}
              disabled={disabled || submitting}
              onRetry={onRetry}
            />
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
