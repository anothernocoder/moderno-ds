<script lang="ts">
  import type { ComponentProps } from "svelte";
  import ShoppingCart from "@/components/blocks/ShoppingCart.svelte";

  type CartDestination = "home" | "shop" | "privacy" | "terms";

  interface Props {
    /** The page's heading, the shopping-cart block's heading raised to `h1`. */
    heading?: string;
    /** The lines in the cart. Leave it out for the block's samples; `[]` is the empty state. */
    items?: ComponentProps<typeof ShoppingCart>["items"];
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
    onquantitychange?: (id: string, quantity: number) => void;
    /** A line's Remove button was pressed. */
    onremove?: (id: string) => void;
    /** Checkout was pressed. */
    oncheckout?: () => void;
    /** "Try again" after `error`. */
    onretry?: () => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: CartDestination, event: MouseEvent) => void;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Continue shopping" points. */
    shopHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }

  let {
    heading = "Your cart",
    items,
    subtotal,
    note,
    error,
    loading = false,
    disabled = false,
    onquantitychange,
    onremove,
    oncheckout,
    onretry,
    onnavigate,
    homeHref = "#",
    shopHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();
</script>

<div class="@container moderno-screen-cart min-h-dvh bg-background text-foreground">
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
        href={shopHref}
        onclick={(event) => onnavigate?.("shop", event)}
      >
        Continue shopping
      </a>
    </header>

    <div class="mx-auto w-full max-w-5xl">
      <ShoppingCart
        headingLevel={1}
        {heading}
        {items}
        {subtotal}
        {note}
        {error}
        {loading}
        {disabled}
        {onquantitychange}
        {onremove}
        {oncheckout}
        {onretry}
      />
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
