import type { MouseEvent } from "react";
import { Badge, Button, Card } from "@moderno-ui/react";
import { OrderSummary, type OrderItem, type OrderTotal } from "@/components/blocks/order-summary";

export type ConfirmationDestination = "home" | "orders" | "privacy" | "terms";

export interface ConfirmationProps {
  /** The page's `h1`. */
  heading?: string;
  /** The line under the heading; `""` hides it. */
  description?: string;
  /** The order's reference as people read it, like `"#MD-10482"`; `""` hides the row. */
  orderNumber?: string;
  /** When the order should arrive, like `"Tue, 6 October"`. Leave it out to hide the row. */
  delivery?: string;
  /** Where the receipt was sent. Leave it out to hide the row. */
  email?: string;
  /** The lines that were ordered. Leave it out for the block's samples; `[]` is the empty state. */
  items?: OrderItem[];
  /** The rows above the total, like subtotal, shipping and taxes. */
  totals?: OrderTotal[];
  /** The amount paid as people read it, like `"€168"`. */
  total?: string;
  /** The order is on its way: placeholder lines in a busy region replace the summary. */
  loading?: boolean;
  /** Loading the order failed: an error alert with a retry replaces the summary. */
  error?: string;
  /** Everything stays on screen and every control is inert. */
  disabled?: boolean;
  /** "Continue shopping" was pressed. */
  onContinue?: () => void;
  /** "Try again" after `error`. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: ConfirmationDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Your orders" points. */
  ordersHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function Confirmation({
  heading = "Thank you for your order",
  description = "Your order is placed. We will email you again when it ships.",
  orderNumber = "#MD-10482",
  delivery,
  email,
  items,
  totals,
  total,
  loading = false,
  error,
  disabled = false,
  onContinue,
  onRetry,
  onNavigate,
  homeHref = "#",
  ordersHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: ConfirmationProps) {
  return (
    <div className="@container moderno-screen-confirmation min-h-dvh bg-background text-foreground">
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
            href={ordersHref}
            onClick={(event) => onNavigate?.("orders", event)}
          >
            Your orders
          </a>
        </header>

        <div className="mx-auto grid w-full max-w-5xl content-start gap-8 @lg:grid-cols-5 @lg:items-start">
          <div className="@lg:col-span-2 @lg:pt-16">
            <Card.Root>
              <Card.Content className="grid gap-6">
                <div className="grid justify-items-start gap-3">
                  <Badge variant="success" dot>
                    Order placed
                  </Badge>
                  <h1 className="font-serif text-heading-sm text-balance @md:text-heading">
                    {heading}
                  </h1>
                  {description ? (
                    <p className="text-body text-muted-foreground text-pretty">{description}</p>
                  ) : null}
                </div>
                {orderNumber || delivery || email ? (
                  <dl className="grid gap-3 border-t border-border pt-6">
                    {orderNumber ? (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-ui-md text-muted-foreground">Order number</dt>
                        <dd className="text-ui-md font-medium tabular-nums">{orderNumber}</dd>
                      </div>
                    ) : null}
                    {delivery ? (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-ui-md text-muted-foreground">Estimated delivery</dt>
                        <dd className="text-ui-md font-medium">{delivery}</dd>
                      </div>
                    ) : null}
                    {email ? (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-ui-md text-muted-foreground">Receipt sent to</dt>
                        <dd className="min-w-0 text-ui-md font-medium break-words">{email}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                <Button type="button" className="w-full" disabled={disabled} onClick={onContinue}>
                  Continue shopping
                </Button>
              </Card.Content>
            </Card.Root>
          </div>
          <div className="@lg:col-span-3">
            <OrderSummary
              items={items}
              totals={totals}
              total={total}
              error={error}
              loading={loading}
              disabled={disabled}
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
