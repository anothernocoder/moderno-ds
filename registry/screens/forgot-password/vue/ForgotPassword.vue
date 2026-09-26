<script setup lang="ts">
/**
 * ForgotPassword — the full-viewport recovery screen: the card that asks for an
 * address and then confirms the link is on its way. Copy it into your project
 * with `moderno add forgot-password-vue`; the block it composes arrives with it,
 * and every file is yours from that moment.
 *
 * Two states, one screen. `sent` is the whole of it: unsent, the card asks for
 * the address; sent, the same card confirms. Nothing moves — the masthead and
 * the footer stay where they were and only the card's contents change, because
 * a page that re-lays itself out at the moment of confirmation makes the reader
 * find it again just when they were told to look somewhere else.
 *
 * It never says whether the address has an account: the confirmation reads "if
 * that address has an account" and the same card renders either way. A recovery
 * form that answers differently for a known and an unknown address is an
 * account-enumeration endpoint, and the code behind the `submit` listener has to
 * keep the same promise — one response, one timing, for every address.
 *
 * Presentational: the screen owns the viewport and nothing else — no address, no
 * request, no router, and not even `sent`, which the mounting page holds because
 * only the request knows whether the mail went out. `submit` is the request *and*
 * the resend, so one listener serves both; `navigate` names every link the screen
 * draws itself and carries the click event with it, so a router can
 * `preventDefault()` after reading `metaKey`.
 *
 * The card's "Sign in" link is an `href` rather than an emit: someone here is
 * already locked out, and a way back that only works once the JavaScript has
 * loaded is no way back at all.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide that
 * landmark and two visible ones in a document is invalid.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width is read off the screen's own
 * `@container`: at `@sm` (--container-sm) the masthead stops stacking, at `@md`
 * (--container-md) the footer does.
 *
 * States: `loading` and `disabled` make the card inert; `error` raises the
 * form-level alert and `errors.email` marks a malformed address, which leaks
 * nothing.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import LoginForm from "@/components/blocks/LoginForm.vue";

type ForgotPasswordDestination = "home" | "support" | "privacy" | "terms";

withDefaults(
  defineProps<{
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
  }>(),
  {
    sent: false,
    sentTo: "",
    error: undefined,
    errors: undefined,
    loading: false,
    disabled: false,
    signInHref: "#",
    homeHref: "#",
    supportHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `submit` is the native form event — the request and the resend alike;
 * `navigate` names the destination a link the screen draws itself points at and
 * hands back the click event that did it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  navigate: [destination: ForgotPasswordDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-forgot-password min-h-dvh bg-background text-foreground">
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
          Still stuck?
          <a
            class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="supportHref"
            @click="emit('navigate', 'support', $event)"
          >
            Contact support
          </a>
        </p>
      </header>

      <div class="mx-auto grid w-full max-w-sm content-center">
        <LoginForm
          mode="forgot-password"
          :title-level="1"
          :sent="sent"
          :sent-to="sentTo"
          :error="error"
          :errors="errors"
          :loading="loading"
          :disabled="disabled"
          :sign-in-href="signInHref"
          @submit="emit('submit', $event)"
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
