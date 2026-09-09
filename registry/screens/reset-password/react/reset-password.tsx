import type { FormEvent, MouseEvent } from "react";
import { AlertList, type AlertListItem } from "@/components/blocks/alert-list";
import { LoginForm, type PasswordRequirement } from "@/components/blocks/login-form";

/**
 * ResetPassword — the full-viewport screen at the end of the emailed link: the
 * card that takes a new password and its confirmation, with the rules ticking
 * off as they are met, and beside it the notes saying what using this link
 * actually does. Copy it into your project with
 * `moderno add reset-password-react`; the blocks it composes arrive with it,
 * and every file is yours from that moment.
 *
 * **The last step of the recovery, not a settings form.** The person here got
 * to this URL from an email and is still locked out, so the screen asks for one
 * thing — the password, twice — and never for the old one: if they knew it they
 * would not be here. The token out of the link travels in the form, so the
 * whole screen works on a page whose JavaScript never arrived.
 *
 * **The rules are said out loud, not enforced.** `requirements` is a list of
 * `{ id, label, met }`; the card prints it as the new-password field's own
 * helper text, so a screen reader hears the rules on focus, and each line is
 * announced as it flips. Whether a rule is met is computed by whatever holds
 * the value — this screen holds none — and the server has to check every one of
 * them again anyway: a rule the browser enforced is a rule an attacker skipped.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no value,
 * no request, no router, and no verdict on the token. It renders what it is
 * handed and reports what the reader did: `onSubmit` for the form, `onNavigate`
 * for every link it draws itself.
 *
 * The card's "Sign in" link is an `href` rather than a callback, forwarded as
 * `signInHref`, and the screen's own links carry an `href` too and call
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
 *   and stand beside it, so what this link is about to do is read *before* the
 *   password is chosen rather than after it has been saved.
 *
 * **States.** `loading` and `disabled` make the card inert; `errors.password`
 * marks a password the rules reject and `errors.confirmPassword` two that do
 * not match. `error` is the form-level failure, and it is where an expired or
 * already-used link belongs — with `disabled` beside it, so a screen that
 * cannot accept a password does not pretend to take one. The notes carry their
 * own `noticesLoading` and `noticesError`, and the *empty* case is the screen's
 * own: with `notices={[]}` the aside is not rendered at all and the card sits
 * centred and alone.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type ResetPasswordDestination = "home" | "support" | "privacy" | "terms";

/**
 * What this screen answers before it is asked: what the link does, what changes
 * when the password does, and the easiest way to pick one. Delete it and pass
 * your own `notices` — or rewrite it in place, the file is yours.
 */
const resetNotices: AlertListItem[] = [
  {
    id: "single-use",
    variant: "info",
    title: "This link works once",
    description:
      "Saving a password retires it. Ask for a new link from the sign-in page if you need to start again.",
    meta: "One use",
  },
  {
    id: "sessions",
    variant: "warning",
    title: "Everywhere else gets signed out",
    description:
      "Phones, tablets and any browser you left open will ask for the new password the next time they are used.",
    meta: "All devices",
  },
  {
    id: "manager",
    variant: "info",
    title: "Let a password manager choose it",
    description:
      "Both fields are marked as a new password, so a manager offers to generate one and then to save it.",
    meta: "Recommended",
  },
];

export interface ResetPasswordProps {
  /** The token out of the emailed link, submitted with the password from a hidden input. */
  token?: string;
  /** The rules under the new password and whether each is met yet; recompute them as the reader types. */
  requirements?: PasswordRequirement[];
  /** Form-level failure: the link has expired, has been used, or the save failed. */
  error?: string;
  /** Per-field messages keyed by the field's `name` (`password`, `confirmPassword`). */
  errors?: Record<string, string>;
  /** The submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** No password can be set here — pair it with `error` when the link is spent. */
  disabled?: boolean;
  /** Notes to show beside the card. `[]` renders the card alone. */
  notices?: AlertListItem[];
  /** The notes could not be loaded; that message replaces the list. */
  noticesError?: string;
  /** The notes are still loading: a busy region stands in for the list. */
  noticesLoading?: boolean;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (
    destination: ResetPasswordDestination,
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

export function ResetPassword({
  token = "",
  requirements,
  error,
  errors,
  loading = false,
  disabled = false,
  notices = resetNotices,
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
}: ResetPasswordProps) {
  const showNotices = Boolean(noticesError) || noticesLoading || notices.length > 0;

  return (
    <div className="@container moderno-screen-reset-password min-h-dvh bg-background text-foreground">
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
            Link expired?{" "}
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
              mode="reset-password"
              titleLevel={1}
              token={token}
              requirements={requirements}
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
                heading="What this link does"
                description="Worth knowing before you choose the password."
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
