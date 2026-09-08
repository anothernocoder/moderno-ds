<script setup lang="ts">
/**
 * Verify — the full-viewport screen between "we sent you a code" and an account
 * that is actually usable: the card that takes the code a cell at a time and can
 * ask for a new one, and beside it the notes that answer "it has not arrived".
 * Copy it into your project with `moderno add verify-vue`; the blocks it
 * composes arrive with it, and every file is yours from that moment.
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
 * The notes sit in an `<aside>`, deliberately unlabelled: the block's own
 * `heading` is the `<h2>` inside it, and an `aria-label` repeating that string
 * would make a screen reader announce the same sentence twice. The root is a
 * `<div>`, not a `<main>`: most app shells already provide that landmark and two
 * visible ones in a document is invalid.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width is read off the screen's own
 * `@container`: at `@sm` (--container-sm) the masthead stops stacking, at `@md`
 * (--container-md) the footer does, and at `@lg` (--container-lg) the notes leave
 * their place under the card and stand beside it.
 *
 * States: `loading` and `disabled` make the card inert; `errors.code` marks a
 * code that was wrong or has expired; `error` is the form-level failure and the
 * place "too many attempts" belongs — with `disabled` beside it. `resendIn`
 * locks the resend and says for how long; `resent` rewrites the card's header.
 * The notes carry `noticesLoading` and `noticesError`; the empty case is the
 * screen's own — with `:notices="[]"` the aside is not rendered at all.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";
import AlertList from "@/components/blocks/AlertList.vue";
import LoginForm from "@/components/blocks/LoginForm.vue";

type VerifyDestination = "home" | "support" | "privacy" | "terms";

/** One note, as the alert-list block renders it. */
interface Notice {
  id: string;
  variant: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  meta?: string;
  actionLabel?: string;
}

/**
 * What this screen answers before it is asked — all three are versions of "it
 * has not arrived", which is the only question this page ever gets. Delete it
 * and pass your own `notices`, or rewrite it in place: the file is yours.
 */
const verifyNotices: Notice[] = [
  {
    id: "expiry",
    variant: "info",
    title: "The code lasts 10 minutes",
    description:
      "After that it stops working and you can ask for a new one from the button under the code.",
    meta: "10 minutes",
  },
  {
    id: "spam",
    variant: "warning",
    title: "Nothing in your inbox?",
    description:
      "Look in spam and in any filtered or promotions tab. A code that landed there still works.",
    meta: "Check spam",
  },
  {
    id: "latest",
    variant: "info",
    title: "Only the newest code works",
    description:
      "Asking for a new one retires the one before it, so use the most recent mail rather than the first.",
    meta: "One at a time",
  },
];

const props = withDefaults(
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
    /** Notes to show beside the card. `[]` renders the card alone. */
    notices?: Notice[];
    /** The notes could not be loaded; that message replaces the list. */
    noticesError?: string;
    /** The notes are still loading: a busy region stands in for the list. */
    noticesLoading?: boolean;
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
    notices: undefined,
    noticesError: undefined,
    noticesLoading: false,
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
  noticeAction: [id: string];
  dismissNotice: [id: string];
  dismissNotices: [];
  retryNotices: [];
}>();

/**
 * Resolved beside the props rather than as a `withDefaults` factory: a default
 * that reads a `const` from this same `<script setup>` is hoisted out of
 * `setup()` and `@vue/compiler-sfc` refuses to compile the file.
 */
const notices = computed(() => props.notices ?? verifyNotices);

const showNotices = computed(
  () => Boolean(props.noticesError) || props.noticesLoading || notices.value.length > 0,
);
</script>

<template>
  <div class="@container moderno-screen-verify min-h-dvh bg-background text-foreground">
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
      <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
        <a
          class="rounded-sm text-base font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="homeHref"
          @click="emit('navigate', 'home', $event)"
        >
          Moderno
        </a>
        <p class="text-sm text-muted-foreground">
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

      <div class="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
        <div class="mx-auto w-full max-w-sm">
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

        <aside v-if="showNotices" class="mx-auto w-full max-w-md">
          <AlertList
            heading="If the code has not arrived"
            description="Three things worth trying before asking for another one."
            :alerts="notices"
            :error="noticesError"
            :loading="noticesLoading"
            @action="emit('noticeAction', $event)"
            @dismiss="emit('dismissNotice', $event)"
            @dismiss-all="emit('dismissNotices')"
            @retry="emit('retryNotices')"
          />
        </aside>
      </div>

      <footer
        class="grid gap-2 text-sm text-muted-foreground @md:flex @md:items-center @md:justify-between"
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
