<script setup lang="ts">
/**
 * SignIn — the full-viewport sign-in screen: the credential form, and beside it
 * the notices a person needs *before* they try to sign in (an incident, a
 * migration window, a password policy that changed). Copy it into your project
 * with `moderno add sign-in-vue`; the blocks it composes arrive with it, and
 * every file is yours from that moment.
 *
 * Presentational: the screen owns the viewport and nothing else — no
 * credentials, no request, no router. It renders the `error` / `loading` /
 * `notices` it is handed and emits what the reader did (`submit` for the
 * credentials, `navigate` for every link it draws itself). Which route those
 * destinations map to, and what happens after a successful sign-in, stay in the
 * page that mounts this.
 *
 * Both links inside the form (recovery and sign-up) are `href`s rather than
 * emits — a credential-recovery link has to work when hydration fails, which is
 * exactly the moment someone is locked out — so the screen forwards
 * `forgotHref` and `signUpHref` to the block. Its own links carry an `href` too
 * and emit `navigate` with the destination *and* the click event on top, so a
 * client router can `preventDefault()` — and read `metaKey` before it does, to
 * leave a ctrl/cmd-click to the browser — while the markup keeps its meaning
 * without JavaScript.
 *
 * The notices sit in an `<aside>`, deliberately unlabelled: the block's own
 * `heading` is the `h2` inside it, and an `aria-label` repeating that string
 * would make a screen reader announce the same sentence twice.
 *
 * The root is a `<div>`, not a `<main>`: the screen is the page's content, but
 * whether it *is* the `main` landmark depends on the route that mounts it —
 * most app shells already provide one, and two visible `<main>` elements in a
 * document is invalid. If your route has none, make this element your `<main>`;
 * the `<header>` and `<footer>` here are the page's banner and contentinfo the
 * moment the screen is not nested inside another landmark.
 *
 * Responsive to its container, not the viewport (ADR-0005). Full-viewport is a
 * *height* — `min-h-dvh` — and every width decision is read off the screen's own
 * `@container`: at `@sm` (--container-sm, 24rem) the masthead stops stacking and
 * the wordmark shares a row with the support link; at `@md` (--container-md,
 * 36rem) the footer stops stacking and the copyright shares a row with the legal
 * links; at `@lg` (--container-lg, 48rem) the notices leave their place under
 * the card and stand beside it, so the form is at eye level and the notices are
 * read on the way to it rather than after it.
 *
 * States: `loading` and `disabled` make the form inert; `error` raises the
 * form-level alert (both credential fields invalid, neither named). The notices
 * carry their own three — `noticesLoading` stands a busy region in for the list,
 * `noticesError` says the notices could not be loaded rather than pretending
 * there are none, and the empty case is the screen's own: with `:notices="[]"`
 * the aside is not rendered at all and the card sits centred and alone, because
 * "nothing is wrong today" is best said by showing nothing.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";
import AlertList from "@/components/blocks/AlertList.vue";
import LoginForm from "@/components/blocks/LoginForm.vue";

type SignInDestination = "home" | "support" | "privacy" | "terms";

/** One notice, in the shape the AlertList block reads. */
interface Notice {
  id: string;
  variant: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  meta?: string;
  actionLabel?: string;
}

/**
 * The notices this screen shows by default: what a person hitting a sign-in
 * page actually needs to know before typing. Delete it and pass your own
 * `notices` — or rewrite it in place, the file is yours.
 */
const serviceNotices: Notice[] = [
  {
    id: "incident",
    variant: "warning",
    title: "Sign-in is slower than usual",
    description: "Our identity provider is degraded. Signing in can take up to a minute.",
    meta: "Updated 10 min ago",
    actionLabel: "Status page",
  },
  {
    id: "maintenance",
    variant: "info",
    title: "Maintenance on Sunday 02:00–04:00 UTC",
    description: "The workspace is read-only for the window. No action is needed from you.",
    meta: "Yesterday",
  },
];

const props = withDefaults(
  defineProps<{
    /** Sign-in failed. Raises the form-level alert and invalidates both fields. */
    error?: string;
    /** The submit is in flight: every control is inert and the button reads busy. */
    loading?: boolean;
    /** Sign-in is unavailable (an SSO-only workspace, a locked account). */
    disabled?: boolean;
    /** Service notices to show beside the form. `[]` renders the form alone. */
    notices?: Notice[];
    /** The notices could not be loaded; that message replaces the list. */
    noticesError?: string;
    /** The notices are still loading: a busy region stands in for the list. */
    noticesLoading?: boolean;
    /** Where "Forgot your password?" points. */
    forgotHref?: string;
    /** Where "Create an account" points. */
    signUpHref?: string;
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
    error: undefined,
    loading: false,
    disabled: false,
    notices: undefined,
    noticesError: undefined,
    noticesLoading: false,
    forgotHref: "#",
    signUpHref: "#",
    homeHref: "#",
    supportHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `submit` is the native form event; `navigate` names the destination a link
 * the screen draws itself points at and hands back the click event that did it,
 * so the listener can `preventDefault()`. The notice emits mirror the block's.
 */
const emit = defineEmits<{
  submit: [event: Event];
  navigate: [destination: SignInDestination, event: MouseEvent];
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
const notices = computed(() => props.notices ?? serviceNotices);

const showNotices = computed(
  () => Boolean(props.noticesError) || props.noticesLoading || notices.value.length > 0,
);
</script>

<template>
  <div class="@container moderno-screen-sign-in min-h-dvh bg-background text-foreground">
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
          Cannot get in?
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
            :title-level="1"
            :error="error"
            :loading="loading"
            :disabled="disabled"
            :forgot-href="forgotHref"
            :sign-up-href="signUpHref"
            @submit="emit('submit', $event)"
          />
        </div>

        <aside v-if="showNotices" class="mx-auto w-full max-w-md">
          <AlertList
            heading="Before you sign in"
            description="Anything affecting access right now."
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
