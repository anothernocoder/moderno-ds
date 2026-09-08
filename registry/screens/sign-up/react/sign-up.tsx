import type { FormEvent, MouseEvent } from "react";
import { LoginForm } from "@/components/blocks/login-form";

/**
 * SignUp — the full-viewport account-creation screen: the credential card in
 * its sign-up mode (name, email, a new password, consent), and beside it the
 * three things a person is actually deciding between when they weigh giving you
 * an address. Copy it into your project with `moderno add sign-up-react`; the
 * block it composes arrives with it, and every file is yours from that moment.
 *
 * **One block, deliberately.** The card is the `login-form` block in
 * `mode="sign-up"` — the same card the `sign-in` screen mounts in its other
 * mode, so the two screens of the auth flow are the same object seen twice
 * rather than two designs that happen to sit next to each other. The
 * `form-layout` block is the *other* form shape in this system — titled groups
 * of related fields with one actions row — and it says so itself: its guidance
 * sends a sign-in or sign-up form here. A screen that mounted both would put
 * two forms and two submits on one page.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no
 * credentials, no request, no router. It renders the `error` / `errors` /
 * `loading` it is handed and reports what the reader did — `onSubmit` for the
 * form, `onNavigate` for every link it draws itself. Whether the address is
 * already taken, what a strong password is, and where a created account goes
 * next are all the mounting page's business.
 *
 * The card's own links (the sign-in link in its footer, the terms and privacy
 * links under the consent box) are `href`s rather than callbacks — the legal
 * text a person is being asked to agree to must be reachable when hydration
 * fails, or the consent is not informed — so the screen forwards `signInHref`,
 * `termsHref` and `privacyHref` to the block. Its own links carry an `href` too
 * and call `onNavigate(destination, event)` on top: the click event comes with
 * the destination, so a client router can `preventDefault()` — and read
 * `metaKey` before it does, to leave a ctrl/cmd-click to the browser — while
 * the markup keeps its meaning without JavaScript.
 *
 * The highlights sit in an `<aside>` the screen paints itself, the way it
 * paints its masthead and footer: they are the page's argument for signing up,
 * not a reusable section, and the `<h2>` inside names the landmark, so there is
 * no `aria-label` repeating it and no `id` to collide when the screen is
 * mounted more than once on a page (the docs mount it seven times).
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
 *   and the sign-in link share a row.
 * - `@md` (`--container-md`, 36rem) — the footer stops stacking: the copyright
 *   and the legal links share a row.
 * - `@lg` (`--container-lg`, 48rem) — the highlights leave their place under
 *   the card and stand beside it, so the form is at eye level and the reasons
 *   are read on the way to it rather than after it.
 *
 * **States.** `loading` and `disabled` make the form inert; `error` raises the
 * form-level alert (the account could not be created at all — the service is
 * down, the consent box is unticked), and `errors` names the individual fields
 * that were rejected, which a sign-up may do and a sign-in may not. The *empty*
 * case is the screen's own: with `highlights={[]}` the aside is not rendered at
 * all and the card sits centred and alone, which is what an invite-only or
 * internal sign-up should look like.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type SignUpDestination = "home" | "signIn" | "privacy" | "terms";

/** One reason to sign up, as the aside renders it. */
export interface SignUpHighlight {
  /** Stable key. Yours; the screen only uses it to key the list. */
  id: string;
  /** The promise, in a few words. */
  title: string;
  /** The sentence that makes the promise credible. */
  description?: string;
}

/**
 * What this screen argues by default: the three things someone weighs before
 * handing over an address. Delete it and pass your own `highlights` — or
 * rewrite it in place, the file is yours.
 */
const trialHighlights: SignUpHighlight[] = [
  {
    id: "trial",
    title: "Fourteen days, every feature",
    description: "No card up front, and nothing locked behind a call with sales.",
  },
  {
    id: "team",
    title: "Bring the whole team",
    description: "Seats are free for the trial, so you can invite them on day one.",
  },
  {
    id: "exit",
    title: "Leave with your data",
    description: "Export everything as CSV or JSON whenever you like — trial or not.",
  },
];

export interface SignUpProps {
  /** The account could not be created at all. Raises the form-level alert. */
  error?: string;
  /** Per-field messages keyed by the field's `name` (`fullName`, `email`, `password`). */
  errors?: Record<string, string>;
  /** The submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** Sign-up is unavailable (a closed beta, an invite-only workspace). */
  disabled?: boolean;
  /** Reasons to show beside the form. `[]` renders the card alone. */
  highlights?: SignUpHighlight[];
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: SignUpDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where "Sign in" points, in the masthead and in the card's footer. */
  signInHref?: string;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where the privacy links point. */
  privacyHref?: string;
  /** Where the terms links point. */
  termsHref?: string;
}

export function SignUp({
  error,
  errors,
  loading = false,
  disabled = false,
  highlights = trialHighlights,
  onSubmit,
  onNavigate,
  signInHref = "#",
  homeHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: SignUpProps) {
  return (
    <div className="@container moderno-screen-sign-up min-h-dvh bg-background text-foreground">
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
            Already registered?{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={signInHref}
              onClick={(event) => onNavigate?.("signIn", event)}
            >
              Sign in
            </a>
          </p>
        </header>

        <div className="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
          <div className="mx-auto w-full max-w-sm">
            <LoginForm
              mode="sign-up"
              error={error}
              errors={errors}
              loading={loading}
              disabled={disabled}
              onSubmit={onSubmit}
              signInHref={signInHref}
              termsHref={termsHref}
              privacyHref={privacyHref}
            />
          </div>

          {highlights.length > 0 ? (
            <aside className="mx-auto grid w-full max-w-md gap-4">
              <h2 className="text-base font-semibold tracking-tight">What you get on day one</h2>
              <ul className="grid gap-4">
                {highlights.map((highlight) => (
                  <li key={highlight.id} className="grid gap-1 border-l-2 border-border pl-4">
                    <p className="text-sm font-medium">{highlight.title}</p>
                    {highlight.description ? (
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
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
