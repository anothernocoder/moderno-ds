<script setup lang="ts">
import Hero from "@/components/blocks/Hero.vue";

type WelcomeDestination = "home" | "support" | "privacy" | "terms";

withDefaults(
  defineProps<{
    /** The reader's first name. The title greets them by it. */
    name?: string;
    /** The workspace could not be prepared. Shows the message and a retry in place of Continue. */
    error?: string;
    /** The workspace is being prepared: the hero shows placeholders. */
    loading?: boolean;
    /** Continue and Skip are shown but inert. */
    disabled?: boolean;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Contact support" points. */
    supportHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    name: undefined,
    error: undefined,
    loading: false,
    disabled: false,
    homeHref: "#",
    supportHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

const emit = defineEmits<{
  continue: [];
  skip: [];
  retry: [];
  navigate: [destination: WelcomeDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-welcome min-h-dvh bg-background text-foreground">
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
      <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
        <a
          class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="homeHref"
          @click="emit('navigate', 'home', $event)"
        >
          Moderno
        </a>
        <p class="text-ui-md text-muted-foreground">
          Questions?
          <a
            class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="supportHref"
            @click="emit('navigate', 'support', $event)"
          >
            Contact support
          </a>
        </p>
      </header>

      <div class="grid content-center">
        <Hero
          kicker="Getting started"
          :title="name ? `Welcome, ${name}` : 'Welcome to Moderno'"
          subtitle="Let’s set up your workspace. It takes about two minutes, and you can change any of it later."
          primary-action="Continue"
          secondary-action="Skip for now"
          :error="error"
          :loading="loading"
          :disabled="disabled"
          @primary-action="emit('continue')"
          @secondary-action="emit('skip')"
          @retry="emit('retry')"
        />
      </div>

      <footer
        class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between"
      >
        <p>© Moderno</p>
        <nav class="flex gap-4" aria-label="Legal">
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="privacyHref"
            @click="emit('navigate', 'privacy', $event)"
          >
            Privacy
          </a>
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="termsHref"
            @click="emit('navigate', 'terms', $event)"
          >
            Terms
          </a>
        </nav>
      </footer>
    </div>
  </div>
</template>
