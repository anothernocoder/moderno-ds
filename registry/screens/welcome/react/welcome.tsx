import type { MouseEvent } from "react";
import { Hero } from "@/components/blocks/hero";

export type WelcomeDestination = "home" | "support" | "privacy" | "terms";

export interface WelcomeProps {
  /** The reader's first name. The title greets them by it. */
  name?: string;
  /** The workspace could not be prepared. Shows the message and a retry in place of Continue. */
  error?: string;
  /** The workspace is being prepared: the hero shows placeholders. */
  loading?: boolean;
  /** Continue and Skip are shown but inert. */
  disabled?: boolean;
  /** "Continue" was pressed. */
  onContinue?: () => void;
  /** "Skip for now" was pressed. */
  onSkip?: () => void;
  /** "Try again" was pressed, inside the error. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation.
   */
  onNavigate?: (destination: WelcomeDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Contact support" points. */
  supportHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function Welcome({
  name,
  error,
  loading = false,
  disabled = false,
  onContinue,
  onSkip,
  onRetry,
  onNavigate,
  homeHref = "#",
  supportHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: WelcomeProps) {
  return (
    <div className="@container moderno-screen-welcome min-h-dvh bg-background text-foreground">
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
            Questions?{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={supportHref}
              onClick={(event) => onNavigate?.("support", event)}
            >
              Contact support
            </a>
          </p>
        </header>

        <div className="grid content-center">
          <Hero
            kicker="Getting started"
            title={name ? `Welcome, ${name}` : "Welcome to Moderno"}
            subtitle="Let’s set up your workspace. It takes about two minutes, and you can change any of it later."
            primaryAction="Continue"
            secondaryAction="Skip for now"
            error={error}
            loading={loading}
            disabled={disabled}
            onPrimaryAction={onContinue}
            onSecondaryAction={onSkip}
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
