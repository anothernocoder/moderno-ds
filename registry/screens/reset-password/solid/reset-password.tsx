import { Show } from "solid-js";
import { AlertList, type AlertListItem } from "@/components/blocks/alert-list";
import { LoginForm, type PasswordRequirement } from "@/components/blocks/login-form";

/**
 * ResetPassword — the full-viewport screen at the end of the emailed link: the
 * card that takes a new password and its confirmation, with the rules ticking
 * off as they are met, and beside it the notes saying what using this link
 * actually does. Copy it into your project with
 * `moderno add reset-password-solid`; the blocks it composes arrive with it, and
 * every file is yours from that moment.
 *
 * The last step of the recovery, not a settings form. The person here got to
 * this URL from an email and is still locked out, so the screen asks for one
 * thing — the password, twice — and never for the old one: if they knew it they
 * would not be here. The token out of the link travels in the form, so the whole
 * screen works on a page whose JavaScript never arrived.
 *
 * The rules are said out loud, not enforced. `requirements` is a list of
 * `{ id, label, met }`; the card prints it as the new-password field's own
 * helper text, so a screen reader hears the rules on focus and each line is
 * announced as it flips. Whether a rule is met is computed by whatever holds the
 * value — this screen holds none — and the server has to check every one of them
 * again anyway: a rule the browser enforced is a rule an attacker skipped.
 *
 * Presentational: the screen owns the viewport and nothing else — no value, no
 * request, no router, and no verdict on the token. `onSubmit` is the form;
 * `onNavigate` names every link the screen draws itself and hands back the click
 * event with it.
 *
 * The card's "Sign in" link is an `href` rather than a callback: someone here is
 * already locked out, and a way back that only works once the JavaScript has
 * loaded is no way back at all.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width is read off the screen's own
 * `@container`: at `@sm` the masthead stops stacking, at `@md` the footer does,
 * and at `@lg` the notes leave their place under the card and stand beside it,
 * so what this link is about to do is read before the password is chosen.
 *
 * States: `loading` and `disabled` make the card inert; `errors.password` marks
 * a password the rules reject and `errors.confirmPassword` two that do not
 * match. `error` is the form-level failure and the place an expired or
 * already-used link belongs — with `disabled` beside it. The notes carry
 * `noticesLoading` and `noticesError`; the empty case is the screen's own — with
 * `notices={[]}` the aside is not rendered at all.
 *
 * Class strings are written out in full rather than shared through a variable:
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
  onSubmit?: (event: SubmitEvent) => void;
  /**
   * A link the screen draws itself was activated, with the click event that did
   * it: `preventDefault()` on it to route without a document navigation, and
   * read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: ResetPasswordDestination, event: MouseEvent) => void;
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

export function ResetPassword(props: ResetPasswordProps) {
  const notices = () => props.notices ?? resetNotices;
  const showNotices = () =>
    Boolean(props.noticesError) || Boolean(props.noticesLoading) || notices().length > 0;

  return (
    <div class="@container moderno-screen-reset-password min-h-dvh bg-background text-foreground">
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
            Link expired?{" "}
            <a
              class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.supportHref ?? "#"}
              onClick={(event) => props.onNavigate?.("support", event)}
            >
              Contact support
            </a>
          </p>
        </header>

        <div class="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
          <div class="mx-auto w-full max-w-sm">
            <LoginForm
              mode="reset-password"
              titleLevel={1}
              token={props.token}
              requirements={props.requirements}
              error={props.error}
              errors={props.errors}
              loading={props.loading}
              disabled={props.disabled}
              onSubmit={props.onSubmit}
              signInHref={props.signInHref ?? "#"}
            />
          </div>

          <Show when={showNotices()}>
            <aside class="mx-auto w-full max-w-md">
              <AlertList
                heading="What this link does"
                description="Worth knowing before you choose the password."
                alerts={notices()}
                error={props.noticesError}
                loading={props.noticesLoading}
                onAction={props.onNoticeAction}
                onDismiss={props.onDismissNotice}
                onDismissAll={props.onDismissNotices}
                onRetry={props.onRetryNotices}
              />
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
