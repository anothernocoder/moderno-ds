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
  onNavigate?: (destination: PlanSelectDestination, event: MouseEvent) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Talk to sales" points. */
  salesHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function PlanSelect(props: PlanSelectProps) {
  return (
    <div class="@container moderno-screen-plan-select min-h-dvh bg-background text-foreground">
      <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={props.homeHref ?? "#"}
            onClick={(event) => props.onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <p class="text-ui-md text-muted-foreground">
            Need something bigger?{" "}
            <a
              class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.salesHref ?? "#"}
              onClick={(event) => props.onNavigate?.("sales", event)}
            >
              Talk to sales
            </a>
          </p>
        </header>

        <div class="grid content-center">
          <Pricing
            titleLevel={1}
            title={props.title ?? "Choose your plan"}
            description={
              props.description ??
              "Pick the plan that fits your team today. You can change it at any time from your workspace settings."
            }
            plans={props.plans}
            error={props.error}
            loading={props.loading}
            disabled={props.disabled}
            onSelect={props.onSelect}
            onRetry={props.onRetry}
          />
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
