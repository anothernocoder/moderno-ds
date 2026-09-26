import type { FormEvent, MouseEvent } from "react";
import { LoginForm } from "@/components/blocks/login-form";

/**
 * SignIn — the full-viewport sign-in screen: the credential form, centred
 * between a masthead and a footer. Copy it into your project with
 * `moderno add sign-in-react`; the block it composes arrives with it, and every
 * file is yours from that moment.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no
 * credentials, no request, no router. It renders the `error` / `loading` it is
 * handed and reports what the reader did — `onSubmit` for the credentials,
 * `onNavigate` for every link it draws itself. Which route those destinations
 * map to, and what happens after a successful sign-in, stay in the page that
 * mounts this.
 *
 * Both links inside the form (recovery and sign-up) are `href`s rather than
 * callbacks — a credential-recovery link has to work when hydration fails,
 * which is exactly the moment someone is locked out — so the screen forwards
 * `forgotHref` and `signUpHref` to the block. Its own links carry an `href`
 * too and call `onNavigate(destination, event)` on top: the click event comes
 * with the destination, so a client router can `preventDefault()` — and read
 * `metaKey` before it does, to leave a ctrl/cmd-click to the browser — while
 * the markup keeps its meaning without JavaScript.
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
 * screen's own `@container`, so the same file is right embedded in a preview
 * frame, in a desktop app's content pane and on a phone:
 *
 * - `@sm` (`--container-sm`, 24rem) — the masthead stops stacking: the wordmark
 *   and the support link share a row.
 * - `@md` (`--container-md`, 36rem) — the footer stops stacking: the copyright
 *   and the legal links share a row.
 *
 * **States.** `loading` and `disabled` make the form inert; `error` raises the
 * form-level alert (both credential fields invalid, neither named).
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type SignInDestination = "home" | "support" | "privacy" | "terms";

export interface SignInProps {
  /** Sign-in failed. Raises the form-level alert and invalidates both fields. */
  error?: string;
  /** The submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** Sign-in is unavailable (an SSO-only workspace, a locked account). */
  disabled?: boolean;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: SignInDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where "Forgot your password?" points. */
  forgotHref?: string;
  /** Where "Create an account" points. */
  signUpHref?: string;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Contact support" points. */
  supportHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function SignIn({
  error,
  loading = false,
  disabled = false,
  onSubmit,
  onNavigate,
  forgotHref = "#",
  signUpHref = "#",
  homeHref = "#",
  supportHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: SignInProps) {
  return (
    <div className="@container moderno-screen-sign-in min-h-dvh bg-background text-foreground">
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
            Cannot get in?{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={supportHref}
              onClick={(event) => onNavigate?.("support", event)}
            >
              Contact support
            </a>
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-sm content-center">
          <LoginForm
            titleLevel={1}
            error={error}
            loading={loading}
            disabled={disabled}
            onSubmit={onSubmit}
            forgotHref={forgotHref}
            signUpHref={signUpHref}
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
