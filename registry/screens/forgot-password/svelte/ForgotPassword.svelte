<!--
  ForgotPassword — the full-viewport recovery screen: the card that asks for an
  address and then confirms the link is on its way. Copy it into your project
  with `moderno add forgot-password-svelte`; the block it composes arrives with
  it, and every file is yours from that moment.

  Two states, one screen. `sent` is the whole of it: unsent, the card asks for
  the address; sent, the same card confirms. The screen does not swap one
  component for another and does not move anything — the masthead and the footer
  stay exactly where they were, and only the card's contents change. A recovery
  page that re-lays itself out at the moment of confirmation makes the reader
  find the page again just when they were told to go and look somewhere else.

  It never says whether the address has an account. The confirmation reads "if
  that address has an account", and the same card is rendered whether or not one
  exists. That is not coyness: a recovery form that answers differently for a
  known and an unknown address is an account-enumeration endpoint, and the code
  you wire behind `onsubmit` has to keep the same promise — one response, one
  timing, for every address.

  Presentational. The screen owns the viewport and nothing else: no address, no
  request, no router, and not even `sent` — the page that mounts this holds that,
  because whether the mail went out is something only the request knows. It
  renders what it is handed and reports what the reader did: `onsubmit` for the
  form (which is also the resend, so one handler serves both), `onnavigate` for
  every link it draws itself.

  The card's "Sign in" link is an href rather than a callback, forwarded as
  `signInHref`: someone on this screen is already locked out, and a way back to
  the sign-in page that only works once the JavaScript has loaded is no way back
  at all. The screen's own links carry an href too and call
  `onnavigate(destination, event)` on top: the click event comes with the
  destination, so a client router can `preventDefault()` — and read `metaKey`
  before it does, to leave a ctrl/cmd-click to the browser — while the markup
  keeps its meaning without JavaScript.

  The root is a <div>, not a <main>: most app shells already provide the `main`
  landmark, and two visible ones in a document is invalid. If your route has
  none, make this element your <main>; the <header> and <footer> here are the
  page's banner and contentinfo the moment the screen is not nested inside
  another landmark.

  Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
  height — `min-h-dvh` — and every width decision is read off the screen's own
  `@container`: at `@sm` (--container-sm, 24rem) the masthead stops stacking; at
  `@md` (--container-md, 36rem) the footer does.

  States. `loading` and `disabled` make the card inert; `error` raises the
  form-level alert (the mail could not be sent at all), and `errors.email` marks
  a malformed address, which leaks nothing.

  Class strings are written out in full rather than shared through a variable:
  the docs compile the previews' Tailwind from `class` attributes, so a class
  assembled in JS would render here and vanish in the preview.
-->
<script lang="ts">
  import LoginForm from "@/components/blocks/LoginForm.svelte";

  type ForgotPasswordDestination = "home" | "support" | "privacy" | "terms";

  interface Props {
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
    /** Native submit — the request and the resend; call `event.preventDefault()` and read the form yourself. */
    onsubmit?: (event: SubmitEvent) => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: ForgotPasswordDestination, event: MouseEvent) => void;
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
    sent = false,
    sentTo = "",
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

<div class="@container moderno-screen-forgot-password min-h-dvh bg-background text-foreground">
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
        Still stuck?
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
        mode="forgot-password"
        titleLevel={1}
        {sent}
        {sentTo}
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
