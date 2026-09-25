<script setup lang="ts">
/**
 * Verify — the full-viewport screen between "we sent you a code" and an account
 * that is actually usable: the card that takes the code a cell at a time and can
 * ask for a new one. Copy it into your project with `moderno add verify-vue`;
 * the blocks it composes arrive with it, and every file is yours from that
 * moment.
 *
 * The code, not the password. Whoever is here has already given their address
 * and is holding — or hunting for — six digits, so the screen asks for exactly
 * that: one cell per digit, autocomplete="one-time-code" on every one of them so
 * the platform can offer the code straight out of the notification, and a paste
 * of the whole string distributed across the cells rather than rejected.
 *
 * Two ways forward, both plain form submissions. The primary submit checks the
 * code; the second one — a ghost button named `intent`, valued "resend" — asks
 * for a new code. Both post the same form, so one `submit` listener serves both:
 * read the submitter to tell them apart.
 *
 *     @submit="(event) => {
 *       event.preventDefault();
 *       const form = new FormData(event.target, event.submitter);
 *       form.get('intent') === 'resend' ? resend(form.get('email')) : check(form.get('code'));
 *     }"
 *
 * The address travels in a hidden input beside the code, so a resend posted from
 * a page that never hydrated still knows where to send.
 *
 * Presentational: the screen owns the viewport and nothing else — no value, no
 * request, no router, no timer. `resendIn` is a number it renders, not a
 * countdown it runs; the page above ticks it down, because a screen that holds a
 * clock holds state, and a screen that holds state cannot be dropped under any
 * router. `submit` is the native form event; `navigate` names every link the
 * screen draws itself and carries the click event with it, so a router can
 * `preventDefault()` after reading `metaKey`.
 *
 * The card's "Sign in" link is an `href` rather than an emit: a way out that
 * only works once the JavaScript has loaded is no way out at all.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide that
 * landmark and two visible ones in a document is invalid.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width is read off the screen's own
 * `@container`: at `@sm` (--container-sm) the masthead stops stacking, at `@md`
 * (--container-md) the footer does.
 *
 * States: `loading` and `disabled` make the card inert; `errors.code` marks a
 * code that was wrong or has expired; `error` is the form-level failure and the
 * place "too many attempts" belongs — with `disabled` beside it. `resendIn`
 * locks the resend and says for how long; `resent` rewrites the card's header.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import LoginForm from "@/components/blocks/LoginForm.vue";

type VerifyDestination = "home" | "support" | "privacy" | "terms";

withDefaults(
  defineProps<{
    /** The address the code went to: named in the card and submitted from a hidden input, so a resend knows where to send. */
    sentTo?: string;
    /** How many cells the code has, and the number the card's description names. */
    codeLength?: number;
    /** Seconds until another code can be asked for; above zero the resend is locked and says how long. You own the timer. */
    resendIn?: number;
    /** A new code has just gone out: the card's header says so, in the live region it already has. */
    resent?: boolean;
    /** Form-level failure: too many attempts, or an address that is already verified. */
    error?: string;
    /** Per-field messages keyed by the field's `name` (`code`). */
    errors?: Record<string, string>;
    /** A submit is in flight: every control is inert and the button reads busy. */
    loading?: boolean;
    /** No code can be checked here — pair it with `error` when the attempts are spent. */
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
    sentTo: "",
    codeLength: 6,
    resendIn: 0,
    resent: false,
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
 * `submit` is the native form event from either button — read it with the
 * submitter, so `intent` tells a resend from a check. `navigate` names the
 * destination a link the screen draws itself points at and hands back the click
 * event that did it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  navigate: [destination: VerifyDestination, event: MouseEvent];
}>();
</script>

<template>
  <div class="@container moderno-screen-verify min-h-dvh bg-background text-foreground">
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
          Code not arriving?
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
          mode="verify"
          :title-level="1"
          :sent-to="sentTo"
          :code-length="codeLength"
          :resend-in="resendIn"
          :resent="resent"
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
