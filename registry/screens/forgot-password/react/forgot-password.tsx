import type { FormEvent, MouseEvent } from "react";
import { AlertList, type AlertListItem } from "@/components/blocks/alert-list";
import { LoginForm } from "@/components/blocks/login-form";

/**
 * ForgotPassword — the full-viewport recovery screen: the card that asks for an
 * address and then confirms the link is on its way, and beside it the notes
 * that answer the question the reader is about to ask ("it has not arrived").
 * Copy it into your project with `moderno add forgot-password-react`; the blocks
 * it composes arrive with it, and every file is yours from that moment.
 *
 * **Two states, one screen.** `sent` is the whole of it: unsent, the card asks
 * for the address; sent, the same card confirms. The screen does not swap one
 * component for another and does not move anything — the masthead, the notes
 * and the footer stay exactly where they were, and only the card's contents
 * change. A recovery page that re-lays itself out at the moment of confirmation
 * makes the reader find the page again just when they were told to go and look
 * somewhere else.
 *
 * **It never says whether the address has an account.** The confirmation reads
 * "if that address has an account", and the same card is rendered whether or not
 * one exists. That is not coyness: a recovery form that answers differently for
 * a known and an unknown address is an account-enumeration endpoint, and the
 * code you wire behind `onSubmit` has to keep the same promise — one response,
 * one timing, for every address.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no
 * address, no request, no router, and not even `sent` — the page that mounts
 * this holds that, because whether the mail went out is something only the
 * request knows. It renders what it is handed and reports what the reader did:
 * `onSubmit` for the form (which is also the resend, so one handler serves
 * both), `onNavigate` for every link it draws itself.
 *
 * The card's "Sign in" link is an `href` rather than a callback, forwarded as
 * `signInHref`: someone on this screen is already locked out, and a way back to
 * the sign-in page that only works once the JavaScript has loaded is no way
 * back at all. The screen's own links carry an `href` too and call
 * `onNavigate(destination, event)` on top: the click event comes with the
 * destination, so a client router can `preventDefault()` — and read `metaKey`
 * before it does, to leave a ctrl/cmd-click to the browser — while the markup
 * keeps its meaning without JavaScript.
 *
 * The notes sit in an `<aside>`, deliberately unlabelled: the block's own
 * `heading` is the `h2` inside it, and an `aria-label` repeating that string
 * would make a screen reader announce the same sentence twice.
 *
 * The root is a `<div>`, not a `<main>`: the screen is the page's content, but
 * whether it *is* the `main` landmark depends on the route that mounts it —
 * most app shells already provide one, and two visible `<main>` elements in a
 * document is invalid. If your route has none, make this element your `<main>`;
 * the `<header>` and `<footer>` here are the page's banner and contentinfo the
 * moment the screen is not nested inside another landmark.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). Full-viewport
 * is a *height* — `min-h-dvh` — and every width decision is read off the
 * screen's own `@container`:
 *
 * - `@sm` (`--container-sm`, 24rem) — the masthead stops stacking: the wordmark
 *   and the support link share a row.
 * - `@md` (`--container-md`, 36rem) — the footer stops stacking: the copyright
 *   and the legal links share a row.
 * - `@lg` (`--container-lg`, 48rem) — the notes leave their place under the card
 *   and stand beside it, so they are read on the way to the field rather than
 *   after the link has already been asked for.
 *
 * **States.** `loading` and `disabled` make the card inert; `error` raises the
 * form-level alert (the mail could not be sent at all, the address was asked
 * for too many times), and `errors.email` marks a malformed address, which
 * leaks nothing. The notes carry their own three — `noticesLoading`,
 * `noticesError` — and the *empty* case is the screen's own: with `notices={[]}`
 * the aside is not rendered at all and the card sits centred and alone, which is
 * what a recovery page with nothing to warn about should look like.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type ForgotPasswordDestination = "home" | "support" | "privacy" | "terms";

/**
 * What this screen answers before it is asked: the three things a person wonders
 * between pressing "Send reset link" and giving up. Delete it and pass your own
 * `notices` — or rewrite it in place, the file is yours.
 */
const recoveryNotices: AlertListItem[] = [
  {
    id: "expiry",
    variant: "info",
    title: "The link is good for 30 minutes",
    description: "Ask for another whenever you like; sending a new one retires the old.",
    meta: "One use each",
  },
  {
    id: "delivery",
    variant: "info",
    title: "It can land in spam",
    description: "Look under promotions and updates too — the mail comes from a no-reply address.",
    meta: "Usually within a minute",
  },
  {
    id: "sso",
    variant: "warning",
    title: "Signed in with Google or a work account?",
    description: "There is no password to reset. Go back and use the provider you signed up with.",
    meta: "Single sign-on",
  },
];

export interface ForgotPasswordProps {
  /** The link has gone out: the card confirms instead of asking. */
  sent?: boolean;
  /** The address the link went to — named in the confirmation and resubmitted by "Send it again". */
  sentTo?: string;
  /** The link could not be sent at all. Raises the form-level alert. */
  error?: string;
  /** Per-field messages keyed by the field's `name` (here, `email`). */
  errors?: Record<string, string>;
  /** The submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** Recovery is unavailable here (an SSO-only workspace, a locked account). */
  disabled?: boolean;
  /** Notes to show beside the card. `[]` renders the card alone. */
  notices?: AlertListItem[];
  /** The notes could not be loaded; that message replaces the list. */
  noticesError?: string;
  /** The notes are still loading: a busy region stands in for the list. */
  noticesLoading?: boolean;
  /** Native submit — the request *and* the resend; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (
    destination: ForgotPasswordDestination,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  /** A note's own action (`actionLabel`), reported with that note's id. */
  onNoticeAction?: (id: string) => void;
  /** A note was dismissed; you drop it from your own state. */
  onDismissNotice?: (id: string) => void;
  /** Every note was dismissed at once. */
  onDismissNotices?: () => void;
  /** Retry after `noticesError`. */
  onRetryNotices?: () => void;
  /** Where "Sign in" points, in the card's footer. */
  signInHref?: string;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Contact support" points. */
  supportHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function ForgotPassword({
  sent = false,
  sentTo = "",
  error,
  errors,
  loading = false,
  disabled = false,
  notices = recoveryNotices,
  noticesError,
  noticesLoading = false,
  onSubmit,
  onNavigate,
  onNoticeAction,
  onDismissNotice,
  onDismissNotices,
  onRetryNotices,
  signInHref = "#",
  homeHref = "#",
  supportHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: ForgotPasswordProps) {
  const showNotices = Boolean(noticesError) || noticesLoading || notices.length > 0;

  return (
    <div className="@container moderno-screen-forgot-password min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header className="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            className="rounded-sm text-base font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={homeHref}
            onClick={(event) => onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <p className="text-sm text-muted-foreground">
            Still stuck?{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={supportHref}
              onClick={(event) => onNavigate?.("support", event)}
            >
              Contact support
            </a>
          </p>
        </header>

        <div className="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
          <div className="mx-auto w-full max-w-sm">
            <LoginForm
              mode="forgot-password"
              sent={sent}
              sentTo={sentTo}
              error={error}
              errors={errors}
              loading={loading}
              disabled={disabled}
              onSubmit={onSubmit}
              signInHref={signInHref}
            />
          </div>

          {showNotices ? (
            <aside className="mx-auto w-full max-w-md">
              <AlertList
                heading="About the reset link"
                description="What to expect, and what to do if it does not arrive."
                alerts={notices}
                error={noticesError}
                loading={noticesLoading}
                onAction={onNoticeAction}
                onDismiss={onDismissNotice}
                onDismissAll={onDismissNotices}
                onRetry={onRetryNotices}
              />
            </aside>
          ) : null}
        </div>

        <footer className="grid gap-2 text-sm text-muted-foreground @md:flex @md:items-center @md:justify-between">
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
