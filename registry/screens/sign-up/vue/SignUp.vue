<script setup lang="ts">
/**
 * SignUp — the full-viewport account-creation screen: the credential card in
 * its sign-up mode (name, email, a new password, consent), and beside it the
 * three things a person is actually deciding between when they weigh giving you
 * an address. Copy it into your project with `moderno add sign-up-vue`; the
 * block it composes arrives with it, and every file is yours from that moment.
 *
 * One block, deliberately: the card is the `login-form` block in
 * `mode="sign-up"` — the same card the `sign-in` screen mounts in its other
 * mode, so the two screens of the auth flow are the same object seen twice. The
 * `form-layout` block is the other form shape in this system (titled groups of
 * related fields with one actions row) and its own guidance sends a sign-in or
 * sign-up form here; a screen mounting both would put two forms and two submits
 * on one page.
 *
 * Presentational: the screen owns the viewport and nothing else — no
 * credentials, no request, no router. It renders the `error` / `errors` /
 * `loading` it is handed and emits what the reader did (`submit` for the form,
 * `navigate` for every link it draws itself). The card's own links (sign-in,
 * terms, privacy) are `href`s rather than emits — the legal text a person is
 * being asked to agree to must be reachable when hydration fails, or the
 * consent is not informed — so the screen forwards `signInHref`, `termsHref`
 * and `privacyHref` to the block. Its own links carry an `href` too and emit
 * `navigate` with the destination *and* the click event, so a client router can
 * `preventDefault()` after reading `metaKey`.
 *
 * The highlights sit in an `<aside>` the screen paints itself, the way it
 * paints its masthead and footer: they are the page's argument for signing up,
 * not a reusable section, and the `<h2>` inside names the landmark — no
 * `aria-label` repeating it, and no `id` to collide when the screen is mounted
 * more than once on a page.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide the
 * `main` landmark and two visible ones in a document is invalid. If your route
 * has none, make this element your `<main>`.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width decision is read off the screen's own
 * `@container`: at `@sm` (--container-sm, 24rem) the masthead stops stacking; at
 * `@md` (--container-md, 36rem) the footer does; at `@lg` (--container-lg,
 * 48rem) the highlights leave their place under the card and stand beside it.
 *
 * States: `loading` and `disabled` make the form inert; `error` raises the
 * form-level alert (the account could not be created at all), and `errors` names
 * the individual fields that were rejected — which a sign-up may do and a
 * sign-in may not. The empty case is the screen's own: with `:highlights="[]"`
 * the aside is not rendered at all and the card sits centred and alone.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";

import LoginForm from "@/components/blocks/LoginForm.vue";

type SignUpDestination = "home" | "signIn" | "privacy" | "terms";

/** One reason to sign up, as the aside renders it. */
interface Highlight {
  id: string;
  title: string;
  description?: string;
}

/**
 * What this screen argues by default: the three things someone weighs before
 * handing over an address. Delete it and pass your own `highlights` — or
 * rewrite it in place, the file is yours.
 */
const trialHighlights: Highlight[] = [
  {
    id: "trial",
    title: "Fourteen days, every feature",
    description: "No card up front, and nothing locked behind a call with sales.",
  },
  {
    id: "team",
    title: "Bring the whole team",
    description: "Seats are free for the trial, so you can invite them on day one.",
  },
  {
    id: "exit",
    title: "Leave with your data",
    description: "Export everything as CSV or JSON whenever you like — trial or not.",
  },
];

const props = withDefaults(
  defineProps<{
    /** The account could not be created at all. Raises the form-level alert. */
    error?: string;
    /** Per-field messages keyed by the field's `name` (fullName, email, password). */
    errors?: Record<string, string>;
    /** The submit is in flight: every control is inert and the button reads busy. */
    loading?: boolean;
    /** Sign-up is unavailable (a closed beta, an invite-only workspace). */
    disabled?: boolean;
    /** Reasons to show beside the form. `[]` renders the card alone. */
    highlights?: Highlight[];
    /** Where "Sign in" points, in the masthead and in the card's footer. */
    signInHref?: string;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where the privacy links point. */
    privacyHref?: string;
    /** Where the terms links point. */
    termsHref?: string;
  }>(),
  {
    error: undefined,
    errors: undefined,
    loading: false,
    disabled: false,
    highlights: undefined,
    signInHref: "#",
    homeHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `submit` is the native form event; `navigate` names the destination a link
 * the screen draws itself points at and hands back the click event that did it,
 * so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  navigate: [destination: SignUpDestination, event: MouseEvent];
}>();

/**
 * Resolved beside the props rather than as a `withDefaults` factory: a default
 * that reads a `const` from this same `<script setup>` is hoisted out of
 * `setup()` and `@vue/compiler-sfc` refuses to compile the file.
 *
 * Named apart from the prop on purpose. A setup binding outranks a prop of the
 * same name in the template, so a shadowing `highlights` would silently be this
 * one — correct here, and a trap for the next person to read it.
 */
const resolvedHighlights = computed(() => props.highlights ?? trialHighlights);
</script>

<template>
  <div class="@container moderno-screen-sign-up min-h-dvh bg-background text-foreground">
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
          Already registered?
          <a
            class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="signInHref"
            @click="emit('navigate', 'signIn', $event)"
          >
            Sign in
          </a>
        </p>
      </header>

      <div class="grid content-center gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
        <div class="mx-auto w-full max-w-sm">
          <LoginForm
            mode="sign-up"
            :title-level="1"
            :error="error"
            :errors="errors"
            :loading="loading"
            :disabled="disabled"
            :sign-in-href="signInHref"
            :terms-href="termsHref"
            :privacy-href="privacyHref"
            @submit="emit('submit', $event)"
          />
        </div>

        <aside v-if="resolvedHighlights.length > 0" class="mx-auto grid w-full max-w-md gap-4">
          <h2 class="text-base font-semibold tracking-tight">What you get on day one</h2>
          <ul class="grid gap-4">
            <li
              v-for="highlight in resolvedHighlights"
              :key="highlight.id"
              class="grid gap-1 border-l-2 border-border pl-4"
            >
              <p class="text-sm font-medium">{{ highlight.title }}</p>
              <p v-if="highlight.description" class="text-sm text-muted-foreground">
                {{ highlight.description }}
              </p>
            </li>
          </ul>
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
