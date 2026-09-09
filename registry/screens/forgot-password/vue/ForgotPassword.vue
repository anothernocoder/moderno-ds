<script setup lang="ts">
/**
 * ForgotPassword — the full-viewport recovery screen: the card that asks for an
 * address and then confirms the link is on its way, and beside it the notes that
 * answer the question the reader is about to ask ("it has not arrived"). Copy it
 * into your project with `moderno add forgot-password-vue`; the blocks it
 * composes arrive with it, and every file is yours from that moment.
 *
 * Two states, one screen. `sent` is the whole of it: unsent, the card asks for
 * the address; sent, the same card confirms. Nothing moves — the masthead, the
 * notes and the footer stay where they were and only the card's contents change,
 * because a page that re-lays itself out at the moment of confirmation makes the
 * reader find it again just when they were told to look somewhere else.
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
 * States: `loading` and `disabled` make the card inert; `error` raises the
 * form-level alert and `errors.email` marks a malformed address, which leaks
 * nothing. The notes carry `noticesLoading` and `noticesError`; the empty case is
 * the screen's own — with `:notices="[]"` the aside is not rendered at all.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";
import AlertList from "@/components/blocks/AlertList.vue";
import LoginForm from "@/components/blocks/LoginForm.vue";

type ForgotPasswordDestination = "home" | "support" | "privacy" | "terms";

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
 * What this screen answers before it is asked: the three things a person wonders
 * between pressing "Send reset link" and giving up. Delete it and pass your own
 * `notices` — or rewrite it in place, the file is yours.
 */
const recoveryNotices: Notice[] = [
  {
    id: "expiry",
    variant: "info",
    title: "The link is good for 30 minutes",
    description: "Ask for another whenever you like; sending a new one retires the old.",
    meta: "One use each",
  },
  {
    id: "delivery",
    variant: "info",
    title: "It can land in spam",
    description: "Look under promotions and updates too — the mail comes from a no-reply address.",
    meta: "Usually within a minute",
  },
  {
    id: "sso",
    variant: "warning",
    title: "Signed in with Google or a work account?",
    description: "There is no password to reset. Go back and use the provider you signed up with.",
    meta: "Single sign-on",
  },
];

const props = withDefaults(
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
    sent: false,
    sentTo: "",
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
 * `submit` is the native form event — the request and the resend alike;
 * `navigate` names the destination a link the screen draws itself points at and
 * hands back the click event that did it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  navigate: [destination: ForgotPasswordDestination, event: MouseEvent];
  noticeAction: [id: string];
  dismissNotice: [id: string];
  dismissNotices: [];
  retryNotices: [];
}>();

/**
 * Resolved beside the props rather than as a `withDefaults` factory: a default
 * that reads a `const` from this same `<script setup>` is hoisted out of
 * `setup()` and `@vue/compiler-sfc` refuses to compile the file.
 *
 * Named apart from the prop on purpose. A setup binding outranks a prop of the
 * same name in the template, so a shadowing `notices` would silently be this
 * one — correct here, and a trap for the next person to read it.
 */
const resolvedNotices = computed(() => props.notices ?? recoveryNotices);

const showNotices = computed(
  () => Boolean(props.noticesError) || props.noticesLoading || resolvedNotices.value.length > 0,
);
</script>

<template>
  <div class="@container moderno-screen-forgot-password min-h-dvh bg-background text-foreground">
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

      <div class="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
        <div class="mx-auto w-full max-w-sm">
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

        <aside v-if="showNotices" class="mx-auto w-full max-w-md">
          <AlertList
            heading="About the reset link"
            description="What to expect, and what to do if it does not arrive."
            :alerts="resolvedNotices"
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
