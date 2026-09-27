import type { MouseEvent } from "react";
import { ShoppingCart, type CartItem } from "@/components/blocks/shopping-cart";

export type CartDestination = "home" | "shop" | "privacy" | "terms";

export interface CartProps {
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
  /** A line's quantity changed to a whole number from 1 to its maximum. */
  onQuantityChange?: (id: string, quantity: number) => void;
  /** A line's Remove button was pressed. */
  onRemove?: (id: string) => void;
  /** Checkout was pressed. */
  onCheckout?: () => void;
  /** "Try again" after `error`. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: CartDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Continue shopping" points. */
  shopHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function Cart({
  heading = "Your cart",
  items,
  subtotal,
  note,
  error,
  loading = false,
  disabled = false,
  onQuantityChange,
  onRemove,
  onCheckout,
  onRetry,
  onNavigate,
  homeHref = "#",
  shopHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: CartProps) {
  return (
    <div className="@container moderno-screen-cart min-h-dvh bg-background text-foreground">
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
            href={shopHref}
            onClick={(event) => onNavigate?.("shop", event)}
          >
            Continue shopping
          </a>
        </header>

        <div className="mx-auto w-full max-w-5xl">
          <ShoppingCart
            headingLevel={1}
            heading={heading}
            items={items}
            subtotal={subtotal}
            note={note}
            error={error}
            loading={loading}
            disabled={disabled}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            onCheckout={onCheckout}
            onRetry={onRetry}
          />
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
