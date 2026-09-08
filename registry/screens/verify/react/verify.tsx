import type { FormEvent, MouseEvent } from "react";
import { AlertList, type AlertListItem } from "@/components/blocks/alert-list";
import { LoginForm } from "@/components/blocks/login-form";

/**
 * Verify — the full-viewport screen between "we sent you a code" and an account
 * that is actually usable: the card that takes the code a cell at a time and
 * can ask for a new one, and beside it the notes that answer "it has not
 * arrived". Copy it into your project with `moderno add verify-react`; the
 * blocks it composes arrive with it, and every file is yours from that moment.
 *
 * **The code, not the password.** Whoever is here has already given their
 * address and is holding — or hunting for — six digits. So the screen asks for
 * exactly that: one cell per digit, `autocomplete="one-time-code"` on every one
 * of them so the platform can offer the code straight out of the notification,
 * and a paste of the whole string distributed across the cells rather than
 * rejected. It never asks for the password again; that is a different screen.
 *
 * **Two ways forward, both plain form submissions.** The primary submit checks
 * the code. The second one — a ghost button named `intent`, valued `"resend"` —
 * asks for a new code. Both post the same form, so one `onSubmit` serves both:
 * read the submitter to tell them apart.
 *
 * ```tsx
 * onSubmit={(event) => {
 *   event.preventDefault();
 *   const form = new FormData(event.currentTarget, event.nativeEvent.submitter);
 *   if (form.get("intent") === "resend") return resend(String(form.get("email")));
 *   return check(String(form.get("code")));
 * }}
 * ```
 *
 * Nothing here needs JavaScript to be reachable: the address travels in a
 * hidden input beside the code, so a resend posted from a page that never
 * hydrated still knows where to send.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no value,
 * no request, no router, no timer. `resendIn` is a number it renders, not a
 * countdown it runs — the page above ticks it down — because a screen that
 * holds a clock holds state, and a screen that holds state cannot be dropped
 * under any router. It renders what it is handed and reports what the reader
 * did: `onSubmit` for both buttons, `onNavigate` for every link it draws itself.
 *
 * Those links carry an `href` *and* call `onNavigate(destination, event)`: the
 * click event comes with the destination, so a client router can
 * `preventDefault()` — and read `metaKey` before it does, to leave a
 * ctrl/cmd-click to the browser — while the markup keeps its meaning without
 * JavaScript. The card's "Sign in" link is an `href` only, forwarded as
 * `signInHref`.
 *
 * The notes sit in an `<aside>`, deliberately unlabelled: the block's own
 * `heading` is the `h2` inside it, and an `aria-label` repeating that string
 * would make a screen reader announce the same sentence twice.
 *
 * The root is a `<div>`, not a `<main>`: the screen is the page's content, but
 * whether it *is* the `main` landmark depends on the route that mounts it —
 * most app shells already provide one, and two visible `<main>` elements in a
 * document is invalid. If your route has none, make this element your `<main>`.
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
 *   and stand beside it, so "look in spam" is read while the inbox is still
 *   open rather than after the third failed attempt.
 *
 * **States.** `loading` and `disabled` make the card inert; `errors.code` marks
 * a code that was wrong or has expired and prints the reason under the cells;
 * `error` is the form-level failure, and it is where "too many attempts" and
 * "this address is already verified" belong — with `disabled` beside it, so a
 * screen that cannot accept a code does not pretend to take one. `resendIn`
 * locks the resend and says for how long; `resent` rewrites the card's header
 * to confirm that a new code went out. The notes carry their own
 * `noticesLoading` and `noticesError`, and the *empty* case is the screen's
 * own: with `notices={[]}` the aside is not rendered at all and the card sits
 * centred and alone.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type VerifyDestination = "home" | "support" | "privacy" | "terms";

/**
 * What this screen answers before it is asked — all three are versions of "it
 * has not arrived", which is the only question this page ever gets. Delete it
 * and pass your own `notices`, or rewrite it in place: the file is yours.
 */
const verifyNotices: AlertListItem[] = [
  {
    id: "expiry",
    variant: "info",
    title: "The code lasts 10 minutes",
    description:
      "After that it stops working and you can ask for a new one from the button under the code.",
    meta: "10 minutes",
  },
  {
    id: "spam",
    variant: "warning",
    title: "Nothing in your inbox?",
    description:
      "Look in spam and in any filtered or promotions tab. A code that landed there still works.",
    meta: "Check spam",
  },
  {
    id: "latest",
    variant: "info",
    title: "Only the newest code works",
    description:
      "Asking for a new one retires the one before it, so use the most recent mail rather than the first.",
    meta: "One at a time",
  },
];

export interface VerifyProps {
  /** The address the code went to: named in the card and submitted from a hidden input, so a resend knows where to send. */
  sentTo?: string;
  /** How many cells the code has, and the number the card's description names. */
  codeLength?: number;
  /** Seconds until another code can be asked for; above zero the resend is locked and says how long. You own the timer. */
  resendIn?: number;
  /** A new code has just gone out: the card's header says so, in the live region it already has. */
  resent?: boolean;
  /** Form-level failure: too many attempts, or an address that is already verified. */
  error?: string;
  /** Per-field messages keyed by the field's `name` (`code`). */
  errors?: Record<string, string>;
  /** A submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** No code can be checked here — pair it with `error` when the attempts are spent. */
  disabled?: boolean;
  /** Notes to show beside the card. `[]` renders the card alone. */
  notices?: AlertListItem[];
  /** The notes could not be loaded; that message replaces the list. */
  noticesError?: string;
  /** The notes are still loading: a busy region stands in for the list. */
  noticesLoading?: boolean;
  /**
   * Native submit, from either button. Call `event.preventDefault()` and read
   * the form with the submitter — `new FormData(form, event.nativeEvent.submitter)` —
   * so `intent === "resend"` tells a resend from a check.
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: VerifyDestination, event: MouseEvent<HTMLAnchorElement>) => void;
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

export function Verify({
  sentTo = "",
  codeLength = 6,
  resendIn = 0,
  resent = false,
  error,
  errors,
  loading = false,
  disabled = false,
  notices = verifyNotices,
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
}: VerifyProps) {
  const showNotices = Boolean(noticesError) || noticesLoading || notices.length > 0;

  return (
    <div className="@container moderno-screen-verify min-h-dvh bg-background text-foreground">
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
            Code not arriving?{" "}
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
              mode="verify"
              titleLevel={1}
              sentTo={sentTo}
              codeLength={codeLength}
              resendIn={resendIn}
              resent={resent}
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
                heading="If the code has not arrived"
                description="Three things worth trying before asking for another one."
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
