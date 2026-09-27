import type { MouseEvent } from "react";
import { Pricing, type PricingPlan } from "@/components/blocks/pricing";

export type PlanSelectDestination = "home" | "sales" | "privacy" | "terms";

export interface PlanSelectProps {
  /** The page's heading, the pricing block's title raised to `h1`. */
  title?: string;
  /** One or two sentences under the title; `""` hides them. */
  description?: string;
  /** The plans to choose from, in order. Leave it out for the block's samples; `[]` is the empty state. */
  plans?: PricingPlan[];
  /** Loading the plans failed: an error alert with a retry replaces them. */
  error?: string;
  /** The plans are on their way: placeholder cards in a busy region. */
  loading?: boolean;
  /** The plans stay on screen and every button is disabled. */
  disabled?: boolean;
  /** A plan's button was pressed, with that plan's `id`. */
  onSelect?: (id: string) => void;
  /** "Try again" after `error`. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: PlanSelectDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Talk to sales" points. */
  salesHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function PlanSelect({
  title = "Choose your plan",
  description = "Pick the plan that fits your team today. You can change it at any time from your workspace settings.",
  plans,
  error,
  loading = false,
  disabled = false,
  onSelect,
  onRetry,
  onNavigate,
  homeHref = "#",
  salesHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: PlanSelectProps) {
  return (
    <div className="@container moderno-screen-plan-select min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header className="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            className="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={homeHref}
            onClick={(event) => onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <p className="text-ui-md text-muted-foreground">
            Need something bigger?{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={salesHref}
              onClick={(event) => onNavigate?.("sales", event)}
            >
              Talk to sales
            </a>
          </p>
        </header>

        <div className="grid content-center">
          <Pricing
            titleLevel={1}
            title={title}
            description={description}
            plans={plans}
            error={error}
            loading={loading}
            disabled={disabled}
            onSelect={onSelect}
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
