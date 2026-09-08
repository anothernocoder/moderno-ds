<!--
  AuthFlow — the example assembly for the `auth` flow: sign-in → sign-up →
  forgot-password → reset-password → verify, and the navigation state between
  them. Copy it into your project with `moderno add auth-svelte`; the five
  screens and the blocks they compose arrive with it, and every file is yours
  from that moment.

  This is the piece you are expected to rewrite. Every screen under it is
  presentational on purpose — props in, callbacks out, no step, no router, no
  timer — which leaves exactly one question open: what comes after what. That
  question has a different answer in every application, so the design system
  answers it once, in a file whose whole job is to be replaced by yours. The
  screens are the product; this is the worked example.

  What it owns, and what the screens deliberately do not: `step`, which of the
  five is on the route; `email`, carried from wherever it was typed to wherever
  it is named next; `token`, the secret out of the emailed reset link;
  `resendIn`, the seconds left on the verify resend, ticked down by the one
  timeout in the whole flow — the card renders that number and never runs a
  clock, because a block that owned a timer would own state; `sent` and
  `resent`, the two confirmations a card paints once a recovery link or a fresh
  code has gone out; and `errors`, whatever the last submit rejected. The last
  three belong to the step that produced them, so `go` drops all three on every
  move — a reader who walks back to `forgot-password` finds the form there, not
  the previous address's confirmation.

  Navigation is link interception, not callbacks. Every route between two
  screens is an `href` the card or the masthead draws — "Create an account",
  "Forgot your password?", "Sign in" — because a link out of a sign-in page has
  to work on a page whose JavaScript never arrived, which is precisely the
  moment someone is locked out. So the assembly hands each screen the URLs it
  should point at (`hrefFor`) and catches the clicks on the way up, exactly as a
  client router does: modified clicks and middle clicks are left to the browser,
  and an `href` that is not one of the flow's own is left alone. Swap `hrefFor`
  for your router's URLs and the markup needs no other change.

  ```svelte
  <AuthFlow
    hrefFor={(step) => `/auth/${step}`}
    initialStep={stepFromUrl}
    onstepchange={(step) => goto(`/auth/${step}`)}
    onauthenticated={() => goto("/")}
  />
  ```

  Forward moves are form submissions. Each screen posts a plain <form>; the
  assembly reads it with `new FormData(form, submitter)` — the submitter matters
  on `verify`, where the resend is a second submit rather than a callback — and
  decides where that leaves the reader. Replace the bodies of `submit` with your
  own requests and the shape of the flow survives intact.

  The one edge it cannot own is the email. `reset-password` is reached in real
  life by opening a link in an inbox, i.e. by entering the flow at that step
  with a token out of the URL — which is what `initialStep` and `resetToken` are
  for. With no mail server behind an example, the confirmation offers the link
  as a notice instead; deleting that notice and the branch of `noticeAction` it
  feeds is the first edit most projects will make.

  Where the flow ends. A finished sign-in, a checked code and a saved password
  all call `onauthenticated` with the address and return to the first step. They
  do not clear the form or paint a success page: at that point your router is
  expected to leave, and a flow that drew its own "you are in" screen would be
  holding a sixth screen nobody can install.
-->
<script lang="ts">
  import { untrack } from "svelte";
  import ForgotPassword from "@/components/screens/ForgotPassword.svelte";
  import ResetPassword from "@/components/screens/ResetPassword.svelte";
  import SignIn from "@/components/screens/SignIn.svelte";
  import SignUp from "@/components/screens/SignUp.svelte";
  import Verify from "@/components/screens/Verify.svelte";

  type AuthStep = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

  /** The flow, in order. Each one is what `hrefFor` is asked about. */
  const AUTH_STEPS: readonly AuthStep[] = [
    "sign-in",
    "sign-up",
    "forgot-password",
    "reset-password",
    "verify",
  ];

  interface Props {
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
    /** The flow moved: mirror it in the URL so a reload and the back button land where the reader is. */
    onstepchange?: (step: AuthStep) => void;
    /** The reader is through — signed in, verified or reset. Take them wherever your app begins. */
    onauthenticated?: (email: string) => void;
    /** Where the wordmark points, on every screen. */
    homeHref?: string;
    /** Where "Contact support" points, on every screen. */
    supportHref?: string;
    /** Where the privacy links point, on every screen. */
    privacyHref?: string;
    /** Where the terms links point, on every screen. */
    termsHref?: string;
  }

  let {
    initialStep = "sign-in",
    initialEmail = "",
    resetToken = "",
    resendSeconds = 30,
    codeLength = 6,
    hrefFor = (step: AuthStep) => `#${step}`,
    onstepchange,
    onauthenticated,
    homeHref = "#",
    supportHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

  /**
   * The stand-in for the email, and the only thing in this file that exists
   * because an example has no server. In your product the reader leaves for
   * their inbox here and comes back on a URL, so this row goes away and
   * `initialStep="reset-password"` takes over.
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

  /**
   * The three props the flow *starts* from are read once, on purpose: after the
   * first render the flow owns them, and a parent that later changes
   * `initialStep` is describing where the journey began, not steering it.
   * `untrack` says so to the compiler as well as to the reader.
   */
  let step = $state<AuthStep>(untrack(() => initialStep));
  let email = $state(untrack(() => initialEmail));
  let token = $state(untrack(() => resetToken));
  let sent = $state(false);
  let resendIn = $state(0);
  let resent = $state(false);
  let errors = $state<Record<string, string> | undefined>(undefined);

  /**
   * The flow's clock, and the reason the verify card can stay stateless: one
   * timeout per second while the resend is locked, cleared on every change and
   * when the flow goes away. Nothing below this component knows time is passing.
   */
  $effect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => {
      resendIn = Math.max(0, resendIn - 1);
    }, 1000);
    return () => clearTimeout(timer);
  });

  /**
   * A move, and the one place the flow's per-step transients are dropped.
   * `errors` belongs to the submit that was rejected and `sent` / `resent` to
   * the card that confirmed; none of them outlives the screen that produced it,
   * or asking for a link for a second address would mean reloading the page.
   */
  function go(next: AuthStep) {
    step = next;
    errors = undefined;
    sent = false;
    resent = false;
    onstepchange?.(next);
  }

  /** The flow's exit: the address goes up, and the reader goes wherever you send them. */
  function finish(address: string) {
    resendIn = 0;
    onauthenticated?.(address);
    go("sign-in");
  }

  /** The reverse of `hrefFor`: which step, if any, an `href` in the markup stands for. */
  function stepAt(href: string | null): AuthStep | undefined {
    if (href === null) return undefined;
    return AUTH_STEPS.find((candidate) => hrefFor(candidate) === href);
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
   * submitter is passed because `verify` has two submit buttons and only the
   * one that was pressed appears in the payload: `intent === "resend"` is the
   * request for a new code, anything else is a check.
   *
   * There is no server here, so the checks are the ones a form can make on its
   * own. Replace each branch with your request; the transitions are the part
   * worth keeping.
   */
  function submit(event: SubmitEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement, event.submitter);
    const address = String(form.get("email") ?? "") || email;

    if (step === "sign-in") {
      email = address;
      finish(address);
      return;
    }

    if (step === "sign-up") {
      email = address;
      resendIn = resendSeconds;
      go("verify");
      return;
    }

    if (step === "forgot-password") {
      email = address;
      sent = true;
      return;
    }

    if (step === "reset-password") {
      const password = String(form.get("password") ?? "");
      const confirmation = String(form.get("confirmPassword") ?? "");
      if (password !== confirmation) {
        errors = { confirmPassword: "The two passwords do not match yet." };
        return;
      }
      token = String(form.get("token") ?? "");
      finish(address);
      return;
    }

    if (form.get("intent") === "resend") {
      resendIn = resendSeconds;
      resent = true;
      return;
    }
    const code = String(form.get("code") ?? "");
    if (code.length < codeLength) {
      errors = { code: `The code is ${codeLength} digits long. Fill every cell.` };
      return;
    }
    finish(address);
  }

  /** A note's own action. Only the stand-in for the email has one here. */
  function noticeAction(id: string) {
    if (id !== openTheLink.id) return;
    token = token || "example-token";
    go("reset-password");
  }
</script>

<!--
  The interactive elements here are the anchors the screens draw, which already
  answer the keyboard on their own — Enter on a focused link fires this very
  click. The wrapper is a router's delegated listener, not a control, so it
  wants no role and no key handler of its own.
-->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="moderno-flow-auth" onclick={intercept}>
  {#if step === "sign-in"}
    <SignIn
      onsubmit={submit}
      forgotHref={hrefFor("forgot-password")}
      signUpHref={hrefFor("sign-up")}
      {homeHref}
      {supportHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "sign-up"}
    <SignUp
      {errors}
      onsubmit={submit}
      signInHref={hrefFor("sign-in")}
      {homeHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "forgot-password"}
    <ForgotPassword
      {sent}
      sentTo={email}
      {errors}
      notices={sent ? [openTheLink] : undefined}
      onsubmit={submit}
      onnoticeaction={noticeAction}
      signInHref={hrefFor("sign-in")}
      {homeHref}
      {supportHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "reset-password"}
    <ResetPassword
      {token}
      {errors}
      onsubmit={submit}
      signInHref={hrefFor("sign-in")}
      {homeHref}
      {supportHref}
      {privacyHref}
      {termsHref}
    />
  {:else}
    <Verify
      sentTo={email}
      {codeLength}
      {resendIn}
      {resent}
      {errors}
      onsubmit={submit}
      signInHref={hrefFor("sign-in")}
      {homeHref}
      {supportHref}
      {privacyHref}
      {termsHref}
    />
  {/if}
</div>
