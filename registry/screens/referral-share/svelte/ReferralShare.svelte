<!--
  ReferralShare — the full-viewport screen where a member shares their
  referral link: invite friends by email, copy the link or send it to a
  channel, and see who has joined, then how the reward works. Copy it into
  your project with `moderno add referral-share-svelte`; the block it composes
  arrives with it, and every file is yours from that moment.

  Presentational. The screen owns the viewport and nothing else: no
  request, no router. It renders the link, friends and states it is handed and
  reports what the reader did — `oninvite` with the email they typed,
  `onshare` with the channel, `oncopy`, `onretry` and `onnavigate` for every
  link it draws itself. Sending the invite stays in the page that mounts this.
  `oninvite` and `onshare` may return a promise: the block shows the send as
  busy until it settles, then reports the outcome in a toast.

  Links carry an `href` and call `onnavigate(destination, event)` on top: a
  client router can `preventDefault()` — after reading `metaKey` to leave a
  ctrl/cmd-click to the browser — while the markup still works without
  JavaScript.

  The root is a `<div>`, not a `<main>`: most app shells already provide the
  `main` landmark. If your route has none, make this element your `<main>`.

  Responsive to its container, not the viewport (ADR-0005). Full-viewport
  is a *height* — `min-h-dvh` — and every width decision is read off the
  screen's own `@container`:

  - `@sm` (`--container-sm`, 24rem) — the masthead stops stacking: the
    wordmark shares a row with "Skip for now".
  - `@md` (`--container-md`, 36rem) — the title grows, the three steps sit
    side by side and the footer stops stacking.

  The share-invite block keeps its own `@sm`/`@md`/`@lg` steps.

  States. `error`, `loading` and `disabled` go to the block. With no
  `friends` the block shows its empty state.

  Class strings are written out in full rather than shared through a variable:
  the docs compile the previews' Tailwind from `class` attributes, so a class
  assembled in JS would render here and vanish in the preview.
-->
<script lang="ts">
  import ShareInvite from "@/components/blocks/ShareInvite.svelte";

  type ReferralShareDestination = "home" | "skip" | "privacy" | "terms";

  interface ReferralFriend {
    id: string;
    name: string;
    email: string;
    /** Where their referral stands, shown as a badge: `"Joined"`, `"Invited"`. */
    status: string;
  }

  interface ReferralShareChannel {
    value: string;
    label: string;
  }

  interface Props {
    /** The reader's own referral link. */
    link?: string;
    /** What each side gets when a friend joins, like `"a free month"`. */
    reward?: string;
    /** The friends invited so far. Empty shows the block's empty state. */
    friends?: ReferralFriend[];
    /** The places the link can be sent. Defaults to the block's Email, Slack, LinkedIn and X. */
    channels?: ReferralShareChannel[];
    /** The referral details could not be loaded. Shows the message and a retry. */
    error?: string;
    /** The referral details are loading: the block shows placeholders. */
    loading?: boolean;
    /** Every control is shown but inert. */
    disabled?: boolean;
    /** An email was invited. Return a promise to keep the button busy until it settles. */
    oninvite?: (email: string) => void | Promise<void>;
    /** The link was sent to a channel. Return a promise to report its outcome. */
    onshare?: (channel: string, link: string) => void | Promise<void>;
    /** The link was copied to the clipboard. */
    oncopy?: (link: string) => void;
    /** "Try again" was pressed, inside the error. */
    onretry?: () => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: ReferralShareDestination, event: MouseEvent) => void;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Skip for now" points. */
    skipHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }

  let {
    link = "https://example.com/r/ana-ruiz",
    reward = "a free month",
    friends = [],
    channels,
    error,
    loading = false,
    disabled = false,
    oninvite,
    onshare,
    oncopy,
    onretry,
    onnavigate,
    homeHref = "#",
    skipHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

  const members = $derived(friends.map(({ status, ...friend }) => ({ ...friend, role: status })));
</script>

<div class="@container moderno-screen-referral-share min-h-dvh bg-background text-foreground">
  <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
    <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
      <a
        class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={homeHref}
        onclick={(event) => onnavigate?.("home", event)}
      >
        Moderno
      </a>
      <a
        class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={skipHref}
        onclick={(event) => onnavigate?.("skip", event)}
      >
        Skip for now
      </a>
    </header>

    <div class="mx-auto grid w-full max-w-4xl content-start gap-8">
      <div class="grid gap-1">
        <h1 class="text-heading-sm font-semibold tracking-tight @md:text-heading">
          Invite your friends
        </h1>
        <p class="text-ui-md text-muted-foreground">
          When a friend signs up with your link, you both get {reward}.
        </p>
      </div>

      <section class="grid gap-4">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">Invite and share</h2>
        <ShareInvite
          heading="Your referral link"
          description="Invite friends by email, or send them the link."
          {link}
          {members}
          {channels}
          {error}
          {loading}
          {disabled}
          {oninvite}
          {onshare}
          {oncopy}
          {onretry}
        />
      </section>

      <section class="grid gap-4">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">How it works</h2>
        <ol class="grid gap-4 @md:grid-cols-3">
          <li class="flex gap-3">
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-ui-sm font-semibold"
            >
              1
            </span>
            <div class="grid gap-1">
              <p class="text-ui-md font-medium">Share your link</p>
              <p class="text-ui-md text-muted-foreground">
                Send it by email, or post it where your friends are.
              </p>
            </div>
          </li>
          <li class="flex gap-3">
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-ui-sm font-semibold"
            >
              2
            </span>
            <div class="grid gap-1">
              <p class="text-ui-md font-medium">Your friend signs up</p>
              <p class="text-ui-md text-muted-foreground">
                They create an account from your link.
              </p>
            </div>
          </li>
          <li class="flex gap-3">
            <span
              aria-hidden="true"
              class="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-ui-sm font-semibold"
            >
              3
            </span>
            <div class="grid gap-1">
              <p class="text-ui-md font-medium">You both get {reward}</p>
              <p class="text-ui-md text-muted-foreground">
                It is added to both accounts as soon as they join.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>

    <footer class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
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
