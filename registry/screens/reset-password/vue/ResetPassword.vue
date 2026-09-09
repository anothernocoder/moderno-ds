<script setup lang="ts">
/**
 * ResetPassword — the full-viewport screen at the end of the emailed link: the
 * card that takes a new password and its confirmation, with the rules ticking
 * off as they are met, and beside it the notes saying what using this link
 * actually does. Copy it into your project with
 * `moderno add reset-password-vue`; the blocks it composes arrive with it, and
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
 * request, no router, and no verdict on the token. `submit` is the native form
 * event; `navigate` names every link the screen draws itself and carries the
 * click event with it, so a router can `preventDefault()` after reading
 * `metaKey`.
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
 * States: `loading` and `disabled` make the card inert; `errors.password` marks
 * a password the rules reject and `errors.confirmPassword` two that do not
 * match. `error` is the form-level failure and the place an expired or
 * already-used link belongs — with `disabled` beside it, so a screen that cannot
 * accept a password does not pretend to take one. The notes carry
 * `noticesLoading` and `noticesError`; the empty case is the screen's own — with
 * `:notices="[]"` the aside is not rendered at all.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";
import AlertList from "@/components/blocks/AlertList.vue";
import LoginForm from "@/components/blocks/LoginForm.vue";

type ResetPasswordDestination = "home" | "support" | "privacy" | "terms";

/** One note, as the alert-list block renders it. */
interface Notice {
  id: string;
  variant: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  meta?: string;
  actionLabel?: string;
}

/** One rule under the new password, as the login-form block renders it. */
interface PasswordRequirement {
  id: string;
  label: string;
  met?: boolean;
}

/**
 * What this screen answers before it is asked: what the link does, what changes
 * when the password does, and the easiest way to pick one. Delete it and pass
 * your own `notices` — or rewrite it in place, the file is yours.
 */
const resetNotices: Notice[] = [
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

const props = withDefaults(
  defineProps<{
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
    token: "",
    requirements: undefined,
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
 * `submit` is the native form event; `navigate` names the destination a link the
 * screen draws itself points at and hands back the click event that did it, so
 * the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  navigate: [destination: ResetPasswordDestination, event: MouseEvent];
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
const notices = computed(() => props.notices ?? resetNotices);

const showNotices = computed(
  () => Boolean(props.noticesError) || props.noticesLoading || notices.value.length > 0,
);
</script>

<template>
  <div class="@container moderno-screen-reset-password min-h-dvh bg-background text-foreground">
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
          Link expired?
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
            mode="reset-password"
            :title-level="1"
            :token="token"
            :requirements="requirements"
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
            heading="What this link does"
            description="Worth knowing before you choose the password."
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
