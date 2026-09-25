<!--
  ResetPassword — the full-viewport screen at the end of the emailed link: the
  card that takes a new password and its confirmation, with the rules ticking
  off as they are met. Copy it into your project with
  `moderno add reset-password-svelte`; the block it composes arrives with it,
  and every file is yours from that moment.

  The last step of the recovery, not a settings form. The person here got to
  this URL from an email and is still locked out, so the screen asks for one
  thing — the password, twice — and never for the old one: if they knew it they
  would not be here. The token out of the link travels in the form, so the whole
  screen works on a page whose JavaScript never arrived.

  The rules are said out loud, not enforced. `requirements` is a list of
  `{ id, label, met }`; the card prints it as the new-password field's own
  helper text, so a screen reader hears the rules on focus, and each line is
  announced as it flips. Whether a rule is met is computed by whatever holds the
  value — this screen holds none — and the server has to check every one of them
  again anyway: a rule the browser enforced is a rule an attacker skipped.

  Presentational. The screen owns the viewport and nothing else: no value, no
  request, no router, and no verdict on the token. It renders what it is handed
  and reports what the reader did: `onsubmit` for the form, `onnavigate` for
  every link it draws itself.

  The card's "Sign in" link is an href rather than a callback, forwarded as
  `signInHref`, and the screen's own links carry an href too and call
  `onnavigate(destination, event)` on top: the click event comes with the
  destination, so a client router can `preventDefault()` — and read `metaKey`
  before it does, to leave a ctrl/cmd-click to the browser — while the markup
  keeps its meaning without JavaScript.

  The root is a <div>, not a <main>: most app shells already provide the `main`
  landmark, and two visible ones in a document is invalid. If your route has
  none, make this element your <main>.

  Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
  height — `min-h-dvh` — and every width decision is read off the screen's own
  `@container`: at `@sm` (--container-sm, 24rem) the masthead stops stacking; at
  `@md` (--container-md, 36rem) the footer does.

  States. `loading` and `disabled` make the card inert; `errors.password` marks a
  password the rules reject and `errors.confirmPassword` two that do not match.
  `error` is the form-level failure, and it is where an expired or already-used
  link belongs — with `disabled` beside it, so a screen that cannot accept a
  password does not pretend to take one.

  Class strings are written out in full rather than shared through a variable:
  the docs compile the previews' Tailwind from `class` attributes, so a class
  assembled in JS would render here and vanish in the preview.
-->
<script lang="ts">
  import LoginForm from "@/components/blocks/LoginForm.svelte";

  type ResetPasswordDestination = "home" | "support" | "privacy" | "terms";

  /** One rule under the new password, as the login-form block renders it. */
  interface PasswordRequirement {
    id: string;
    label: string;
    met?: boolean;
  }

  interface Props {
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
    /** Native submit; call `event.preventDefault()` and read the form yourself. */
    onsubmit?: (event: SubmitEvent) => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: ResetPasswordDestination, event: MouseEvent) => void;
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

  let {
    token = "",
    requirements,
    error,
    errors,
    loading = false,
    disabled = false,
    onsubmit,
    onnavigate,
    signInHref = "#",
    homeHref = "#",
    supportHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();
</script>

<div class="@container moderno-screen-reset-password min-h-dvh bg-background text-foreground">
  <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
    <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
      <a
        class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={homeHref}
        onclick={(event) => onnavigate?.("home", event)}
      >
        Moderno
      </a>
      <p class="text-ui-md text-muted-foreground">
        Link expired?
        <a
          class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={supportHref}
          onclick={(event) => onnavigate?.("support", event)}
        >
          Contact support
        </a>
      </p>
    </header>

    <div class="mx-auto grid w-full max-w-sm content-center">
      <LoginForm
        mode="reset-password"
        titleLevel={1}
        {token}
        {requirements}
        {error}
        {errors}
        {loading}
        {disabled}
        {onsubmit}
        {signInHref}
      />
    </div>

    <footer
      class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between"
    >
      <p>© Moderno</p>
      <nav class="flex gap-4" aria-label="Legal">
        <a
          class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={privacyHref}
          onclick={(event) => onnavigate?.("privacy", event)}
        >
          Privacy
        </a>
        <a
          class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={termsHref}
          onclick={(event) => onnavigate?.("terms", event)}
        >
          Terms
        </a>
      </nav>
    </footer>
  </div>
</div>
