<!--
  AuthFlow — the example assembly for the `auth` flow: sign-in → sign-up →
  forgot-password → reset-password → verify, and the navigation state between
  them. Copy it into your project with `moderno add auth-vue`; the five screens
  and the blocks they compose arrive with it, and every file is yours from that
  moment.

  This is the piece you are expected to rewrite. Every screen under it is
  presentational on purpose — props in, events out, no step, no router, no timer
  — which leaves exactly one question open: what comes after what. That question
  has a different answer in every application, so the design system answers it
  once, in a file whose whole job is to be replaced by yours.

  Navigation is link interception, not events: every route between two screens
  is an `href` a card or a masthead draws, because a link out of a sign-in page
  has to work on a page whose JavaScript never arrived. The assembly hands each
  screen the URLs it should point at (`hrefFor`) and catches the clicks on the
  way up, the way a client router does — modified and middle clicks are left to
  the browser, and an href that is not one of the flow's own is left alone.

  What it owns, and what the screens deliberately do not: `step`, `email`,
  `token`, `resendIn`, the two confirmations a card paints once a recovery link
  or a fresh code has gone out (`sent`, `resent`) and `errors`. The last three
  belong to the step that produced them, so `go` drops all three on every move.

  Forward moves are form submissions, read with `new FormData(form, submitter)`;
  the submitter matters on `verify`, where the resend is a second submit rather
  than a callback. The one edge the assembly cannot own is the email:
  `reset-password` is reached in real life by opening a link in an inbox, i.e.
  by entering the flow at that step with a token out of the URL, which is what
  `initialStep` and `resetToken` are for.

  Where the flow ends: a finished sign-in, a checked code and a saved password
  all emit `authenticated` with the address and return to the first step. They
  do not paint a success page — at that point your router is expected to leave,
  and a flow that drew its own "you are in" screen would be holding a sixth
  screen nobody can install.
-->
<script setup lang="ts">
import { ref, watch } from "vue";
import ForgotPassword from "@/components/screens/ForgotPassword.vue";
import ResetPassword from "@/components/screens/ResetPassword.vue";
import SignIn from "@/components/screens/SignIn.vue";
import SignUp from "@/components/screens/SignUp.vue";
import Verify from "@/components/screens/Verify.vue";

type AuthStep = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

/** The flow, in order. Each one is what `hrefFor` is asked about. */
const AUTH_STEPS: readonly AuthStep[] = [
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "verify",
];

const props = withDefaults(
  defineProps<{
    /** Which screen the flow opens on — in a real app, whatever the route says. */
    initialStep?: AuthStep;
    /** An address already known (a returning session, an invitation), pre-carried between steps. */
    initialEmail?: string;
    /** The token out of an emailed reset link, when the route entered the flow at `reset-password`. */
    resetToken?: string;
    /** How long the verify resend stays locked, in seconds. */
    resendSeconds?: number;
    /** How many digits the one-time code has. */
    codeLength?: number;
    /** The URL each step lives at. Give your router's paths; the default is a fragment per step. */
    hrefFor?: (step: AuthStep) => string;
    /** Where the wordmark points, on every screen. */
    homeHref?: string;
    /** Where "Contact support" points, on every screen. */
    supportHref?: string;
    /** Where the privacy links point, on every screen. */
    privacyHref?: string;
    /** Where the terms links point, on every screen. */
    termsHref?: string;
  }>(),
  {
    initialStep: "sign-in",
    initialEmail: "",
    resetToken: "",
    resendSeconds: 30,
    codeLength: 6,
    hrefFor: undefined,
    homeHref: "#",
    supportHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `stepChange` mirrors the flow in your URL so a reload and the back button
 * land where the reader is; `authenticated` is the flow's exit, with the
 * address it finished on.
 */
const emit = defineEmits<{
  stepChange: [step: AuthStep];
  authenticated: [email: string];
}>();

/**
 * Resolved here rather than as a `withDefaults` value: the fallback is the one
 * every screen's links are drawn from, and keeping it in `setup()` means a
 * caller's `hrefFor` and the default are read through exactly one path.
 */
function urlFor(step: AuthStep): string {
  return props.hrefFor ? props.hrefFor(step) : `#${step}`;
}

/**
 * The stand-in for the email, and the only thing in this file that exists
 * because an example has no server. In your product the reader leaves for their
 * inbox here and comes back on a URL, so this row goes away and
 * `initial-step="reset-password"` takes over.
 */
const openTheLink = {
  id: "open-link",
  variant: "success" as const,
  title: "The link is on its way",
  description:
    "In your product this arrives by email and re-enters the flow at reset-password with a token from the URL. There is no mail server behind this example, so open it from here.",
  meta: "Example only",
  actionLabel: "Open the reset link",
};

const step = ref<AuthStep>(props.initialStep);
const email = ref(props.initialEmail);
const token = ref(props.resetToken);
const sent = ref(false);
const resendIn = ref(0);
const resent = ref(false);
const errors = ref<Record<string, string> | undefined>(undefined);

/**
 * The flow's clock, and the reason the verify card can stay stateless: one
 * timeout per second while the resend is locked, cleared on every change and
 * when the flow goes away. Nothing below this component knows time is passing.
 * Not immediate, so a server render never starts a timer it cannot clear.
 */
watch(resendIn, (left, _previous, onCleanup) => {
  if (left <= 0) return;
  const timer = setTimeout(() => {
    resendIn.value = Math.max(0, left - 1);
  }, 1000);
  onCleanup(() => clearTimeout(timer));
});

/**
 * A move, and the one place the flow's per-step transients are dropped.
 * `errors` belongs to the submit that was rejected and `sent` / `resent` to the
 * card that confirmed; none of them outlives the screen that produced it, or
 * asking for a link for a second address would mean reloading the page.
 */
function go(next: AuthStep) {
  step.value = next;
  errors.value = undefined;
  sent.value = false;
  resent.value = false;
  emit("stepChange", next);
}

/** The flow's exit: the address goes up, and the reader goes wherever you send them. */
function finish(address: string) {
  resendIn.value = 0;
  emit("authenticated", address);
  go("sign-in");
}

/** The reverse of `hrefFor`: which step, if any, an `href` in the markup stands for. */
function stepAt(href: string | null): AuthStep | undefined {
  if (href === null) return undefined;
  return AUTH_STEPS.find((candidate) => urlFor(candidate) === href);
}

/**
 * A click on the way up from a screen. If it landed on a link this flow owns,
 * and it is the plain left click a router may take over, the flow navigates
 * itself; anything else — a modified click, a middle click, a link to support
 * or to the terms — is the browser's, untouched.
 */
function intercept(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as HTMLElement | null)?.closest("a");
  if (!link) return;
  const next = stepAt(link.getAttribute("href"));
  if (next === undefined) return;
  event.preventDefault();
  go(next);
}

/**
 * Every forward move in the flow, read off the form that was posted. The
 * submitter is passed because `verify` has two submit buttons and only the one
 * that was pressed appears in the payload: `intent === "resend"` is the request
 * for a new code, anything else is a check.
 *
 * There is no server here, so the checks are the ones a form can make on its
 * own. Replace each branch with your request; the transitions are the part
 * worth keeping.
 */
function submit(event: Event) {
  event.preventDefault();
  const native = event as SubmitEvent;
  const form = new FormData(native.currentTarget as HTMLFormElement, native.submitter);
  const address = String(form.get("email") ?? "") || email.value;

  if (step.value === "sign-in") {
    email.value = address;
    finish(address);
    return;
  }

  if (step.value === "sign-up") {
    email.value = address;
    resendIn.value = props.resendSeconds;
    go("verify");
    return;
  }

  if (step.value === "forgot-password") {
    email.value = address;
    sent.value = true;
    return;
  }

  if (step.value === "reset-password") {
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");
    if (password !== confirmation) {
      errors.value = { confirmPassword: "The two passwords do not match yet." };
      return;
    }
    token.value = String(form.get("token") ?? "");
    finish(address);
    return;
  }

  if (form.get("intent") === "resend") {
    resendIn.value = props.resendSeconds;
    resent.value = true;
    return;
  }
  const code = String(form.get("code") ?? "");
  if (code.length < props.codeLength) {
    errors.value = { code: `The code is ${props.codeLength} digits long. Fill every cell.` };
    return;
  }
  finish(address);
}

/** A note's own action. Only the stand-in for the email has one here. */
function noticeAction(id: string) {
  if (id !== openTheLink.id) return;
  token.value = token.value || "example-token";
  go("reset-password");
}
</script>

<template>
  <!--
    The interactive elements here are the anchors the screens draw, which
    already answer the keyboard on their own — Enter on a focused link fires
    this very click. The wrapper is a router's delegated listener, not a
    control, so it wants no role and no key handler of its own.
  -->
  <div class="moderno-flow-auth" @click="intercept">
    <SignIn
      v-if="step === 'sign-in'"
      :forgot-href="urlFor('forgot-password')"
      :sign-up-href="urlFor('sign-up')"
      :home-href="homeHref"
      :support-href="supportHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="submit"
    />
    <SignUp
      v-else-if="step === 'sign-up'"
      :errors="errors"
      :sign-in-href="urlFor('sign-in')"
      :home-href="homeHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="submit"
    />
    <ForgotPassword
      v-else-if="step === 'forgot-password'"
      :sent="sent"
      :sent-to="email"
      :errors="errors"
      :notices="sent ? [openTheLink] : undefined"
      :sign-in-href="urlFor('sign-in')"
      :home-href="homeHref"
      :support-href="supportHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="submit"
      @notice-action="noticeAction"
    />
    <ResetPassword
      v-else-if="step === 'reset-password'"
      :token="token"
      :errors="errors"
      :sign-in-href="urlFor('sign-in')"
      :home-href="homeHref"
      :support-href="supportHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="submit"
    />
    <Verify
      v-else
      :sent-to="email"
      :code-length="codeLength"
      :resend-in="resendIn"
      :resent="resent"
      :errors="errors"
      :sign-in-href="urlFor('sign-in')"
      :home-href="homeHref"
      :support-href="supportHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="submit"
    />
  </div>
</template>
