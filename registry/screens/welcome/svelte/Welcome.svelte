<script lang="ts">
  import Hero from "@/components/blocks/Hero.svelte";

  type WelcomeDestination = "home" | "support" | "privacy" | "terms";

  interface Props {
    /** The reader's first name. The title greets them by it. */
    name?: string;
    /** The workspace could not be prepared. Shows the message and a retry in place of Continue. */
    error?: string;
    /** The workspace is being prepared: the hero shows placeholders. */
    loading?: boolean;
    /** Continue and Skip are shown but inert. */
    disabled?: boolean;
    /** "Continue" was pressed. */
    oncontinue?: () => void;
    /** "Skip for now" was pressed. */
    onskip?: () => void;
    /** "Try again" was pressed, inside the error. */
    onretry?: () => void;
    /** A link the screen draws itself was activated, with the click event that did it. */
    onnavigate?: (destination: WelcomeDestination, event: MouseEvent) => void;
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
    name,
    error,
    loading = false,
    disabled = false,
    oncontinue,
    onskip,
    onretry,
    onnavigate,
    homeHref = "#",
    supportHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();
</script>

<div class="@container moderno-screen-welcome min-h-dvh bg-background text-foreground">
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
        Questions?
        <a
          class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={supportHref}
          onclick={(event) => onnavigate?.("support", event)}
        >
          Contact support
        </a>
      </p>
    </header>

    <div class="grid content-center">
      <Hero
        kicker="Getting started"
        title={name ? `Welcome, ${name}` : "Welcome to Moderno"}
        subtitle="Let’s set up your workspace. It takes about two minutes, and you can change any of it later."
        primaryAction="Continue"
        secondaryAction="Skip for now"
        {error}
        {loading}
        {disabled}
        onprimaryaction={oncontinue}
        onsecondaryaction={onskip}
        {onretry}
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
