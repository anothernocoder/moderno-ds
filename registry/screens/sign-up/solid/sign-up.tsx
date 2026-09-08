import { For, Show } from "solid-js";
import { LoginForm } from "@/components/blocks/login-form";

/**
 * SignUp — the full-viewport account-creation screen: the credential card in
 * its sign-up mode (name, email, a new password, consent), and beside it the
 * three things a person is actually deciding between when they weigh giving you
 * an address. Copy it into your project with `moderno add sign-up-solid`; the
 * block it composes arrives with it, and every file is yours from that moment.
 *
 * One block, deliberately: the card is the `login-form` block in
 * `mode="sign-up"` — the same card the `sign-in` screen mounts in its other
 * mode, so the two screens of the auth flow are the same object seen twice. The
 * `form-layout` block is the other form shape in this system (titled groups of
 * related fields with one actions row) and its own guidance sends a sign-in or
 * sign-up form here; a screen mounting both would put two forms and two submits
 * on one page.
 *
 * Presentational: the screen owns the viewport and nothing else — no
 * credentials, no request, no router. It renders the `error` / `errors` /
 * `loading` it is handed and reports what the reader did (`onSubmit` for the
 * form, `onNavigate` for every link it draws itself). The card's own links
 * (sign-in, terms, privacy) are `href`s rather than callbacks — the legal text a
 * person is being asked to agree to must be reachable when hydration fails, or
 * the consent is not informed — so the screen forwards `signInHref`,
 * `termsHref` and `privacyHref` to the block. Its own links carry an `href` too
 * and call `onNavigate(destination, event)`, so a client router can
 * `preventDefault()` after reading `metaKey`.
 *
 * The highlights sit in an `<aside>` the screen paints itself, the way it
 * paints its masthead and footer: they are the page's argument for signing up,
 * not a reusable section, and the `<h2>` inside names the landmark — no
 * `aria-label` repeating it, and no `id` to collide when the screen is mounted
 * more than once on a page.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide the
 * `main` landmark and two visible ones in a document is invalid. If your route
 * has none, make this element your `<main>`.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width decision is read off the screen's own
 * `@container`: at `@sm` (--container-sm, 24rem) the masthead stops stacking; at
 * `@md` (--container-md, 36rem) the footer does; at `@lg` (--container-lg,
 * 48rem) the highlights leave their place under the card and stand beside it.
 *
 * States: `loading` and `disabled` make the form inert; `error` raises the
 * form-level alert (the account could not be created at all), and `errors` names
 * the individual fields that were rejected — which a sign-up may do and a
 * sign-in may not. The empty case is the screen's own: with `highlights={[]}`
 * the aside is not rendered at all and the card sits centred and alone.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type SignUpDestination = "home" | "signIn" | "privacy" | "terms";

/** One reason to sign up, as the aside renders it. */
export interface SignUpHighlight {
  id: string;
  title: string;
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
  onSubmit?: (event: SubmitEvent) => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: SignUpDestination, event: MouseEvent) => void;
  /** Where "Sign in" points, in the masthead and in the card's footer. */
  signInHref?: string;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where the privacy links point. */
  privacyHref?: string;
  /** Where the terms links point. */
  termsHref?: string;
}

export function SignUp(props: SignUpProps) {
  const highlights = () => props.highlights ?? trialHighlights;

  return (
    <div class="@container moderno-screen-sign-up min-h-dvh bg-background text-foreground">
      <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            class="rounded-sm text-base font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={props.homeHref ?? "#"}
            onClick={(event) => props.onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <p class="text-sm text-muted-foreground">
            Already registered?{" "}
            <a
              class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.signInHref ?? "#"}
              onClick={(event) => props.onNavigate?.("signIn", event)}
            >
              Sign in
            </a>
          </p>
        </header>

        <div class="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
          <div class="mx-auto w-full max-w-sm">
            <LoginForm
              mode="sign-up"
              error={props.error}
              errors={props.errors}
              loading={props.loading}
              disabled={props.disabled}
              onSubmit={props.onSubmit}
              signInHref={props.signInHref ?? "#"}
              termsHref={props.termsHref ?? "#"}
              privacyHref={props.privacyHref ?? "#"}
            />
          </div>

          <Show when={highlights().length > 0}>
            <aside class="mx-auto grid w-full max-w-md gap-4">
              <h2 class="text-base font-semibold tracking-tight">What you get on day one</h2>
              <ul class="grid gap-4">
                <For each={highlights()}>
                  {(highlight) => (
                    <li class="grid gap-1 border-l-2 border-border pl-4">
                      <p class="text-sm font-medium">{highlight.title}</p>
                      <Show when={highlight.description}>
                        {(description) => (
                          <p class="text-sm text-muted-foreground">{description()}</p>
                        )}
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </aside>
          </Show>
        </div>

        <footer class="grid gap-2 text-sm text-muted-foreground @md:flex @md:items-center @md:justify-between">
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
