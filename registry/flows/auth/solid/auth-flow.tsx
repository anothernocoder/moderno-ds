import { createEffect, createSignal, mergeProps, Match, onCleanup, Switch } from "solid-js";
import { ForgotPassword, type ForgotPasswordNotice } from "@/components/screens/forgot-password";
import { ResetPassword } from "@/components/screens/reset-password";
import { SignIn } from "@/components/screens/sign-in";
import { SignUp } from "@/components/screens/sign-up";
import { Verify } from "@/components/screens/verify";

/** One of the five screens the flow moves between, in the order it moves. */
export type AuthStep = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

/** The flow, in order. Each one is what `hrefFor` is asked about. */
export const AUTH_STEPS: readonly AuthStep[] = [
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "verify",
];

/**
 * The stand-in for the email, and the only thing in this file that exists
 * because an example has no server. In your product the reader leaves for their
 * inbox here and comes back on a URL, so this row goes away and
 * `initialStep="reset-password"` takes over.
 */
const openTheLink: ForgotPasswordNotice = {
  id: "open-link",
  variant: "success",
  title: "The link is on its way",
  description:
    "In your product this arrives by email and re-enters the flow at reset-password with a token from the URL. There is no mail server behind this example, so open it from here.",
  meta: "Example only",
  actionLabel: "Open the reset link",
};

export interface AuthFlowProps {
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
  onStepChange?: (step: AuthStep) => void;
  /** The reader is through — signed in, verified or reset. Take them wherever your app begins. */
  onAuthenticated?: (email: string) => void;
  /** Where the wordmark points, on every screen. */
  homeHref?: string;
  /** Where "Contact support" points, on every screen. */
  supportHref?: string;
  /** Where the privacy links point, on every screen. */
  privacyHref?: string;
  /** Where the terms links point, on every screen. */
  termsHref?: string;
}

/**
 * AuthFlow — the example assembly for the `auth` flow: sign-in → sign-up →
 * forgot-password → reset-password → verify, and the navigation state between
 * them. Copy it into your project with `moderno add auth-solid`; the five
 * screens and the blocks they compose arrive with it, and every file is yours
 * from that moment.
 *
 * **This is the piece you are expected to rewrite.** Every screen under it is
 * presentational on purpose — props in, callbacks out, no step, no router, no
 * timer — which leaves exactly one question open: what comes after what. That
 * question has a different answer in every application, so the design system
 * answers it once, in a file whose whole job is to be replaced by yours.
 *
 * **What it owns**, and what the screens deliberately do not: `step`, `email`,
 * `token`, `resendIn`, the two confirmations a card paints once a recovery link
 * or a fresh code has gone out (`sent`, `resent`) and `errors`. The last three
 * belong to the step that produced them, so `go` drops all three on every move.
 *
 * **Navigation is link interception, not callbacks.** Every route between two
 * screens is an `href` a card or a masthead draws, because a link out of a
 * sign-in page has to work on a page whose JavaScript never arrived — precisely
 * the moment someone is locked out. The assembly hands each screen the URLs it
 * should point at (`hrefFor`) and catches the clicks on the way up, the way a
 * client router does: modified and middle clicks are left to the browser, and
 * an `href` that is not one of the flow's own is left alone.
 *
 * **Forward moves are form submissions**, read with
 * `new FormData(form, submitter)` — the submitter matters on `verify`, where
 * the resend is a second submit rather than a callback. **The one edge the
 * assembly cannot own is the email**: `reset-password` is reached in real life
 * by opening a link in an inbox, i.e. by entering the flow at that step with a
 * token out of the URL, which is what `initialStep` and `resetToken` are for.
 *
 * **Where the flow ends.** A finished sign-in, a checked code and a saved
 * password all call `onAuthenticated` with the address and return to the first
 * step. They do not paint a success page: at that point your router is expected
 * to leave, and a flow that drew its own "you are in" screen would be holding a
 * sixth screen nobody can install.
 */
export function AuthFlow(props: AuthFlowProps) {
  const merged = mergeProps(
    {
      initialStep: "sign-in" as AuthStep,
      initialEmail: "",
      resetToken: "",
      resendSeconds: 30,
      codeLength: 6,
      homeHref: "#",
      supportHref: "#",
      privacyHref: "#",
      termsHref: "#",
    },
    props,
  );

  const [step, setStep] = createSignal<AuthStep>(merged.initialStep);
  const [email, setEmail] = createSignal(merged.initialEmail);
  const [token, setToken] = createSignal(merged.resetToken);
  const [sent, setSent] = createSignal(false);
  const [resendIn, setResendIn] = createSignal(0);
  const [resent, setResent] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string> | undefined>(undefined);

  /**
   * The flow's clock, and the reason the verify card can stay stateless: one
   * timeout per second while the resend is locked, cleared on every change and
   * when the flow goes away. Nothing below this component knows time is passing.
   */
  createEffect(() => {
    const left = resendIn();
    if (left <= 0) return;
    const timer = setTimeout(() => setResendIn(Math.max(0, left - 1)), 1000);
    onCleanup(() => clearTimeout(timer));
  });

  const hrefFor = (target: AuthStep): string =>
    merged.hrefFor ? merged.hrefFor(target) : `#${target}`;

  /**
   * A move, and the one place the flow's per-step transients are dropped.
   * `errors` belongs to the submit that was rejected and `sent` / `resent` to
   * the card that confirmed; none of them outlives the screen that produced it,
   * or asking for a link for a second address would mean reloading the page.
   */
  const go = (next: AuthStep) => {
    setStep(next);
    setErrors(undefined);
    setSent(false);
    setResent(false);
    merged.onStepChange?.(next);
  };

  /** The flow's exit: the address goes up, and the reader goes wherever you send them. */
  const finish = (address: string) => {
    setResendIn(0);
    merged.onAuthenticated?.(address);
    go("sign-in");
  };

  /** The reverse of `hrefFor`: which step, if any, an `href` in the markup stands for. */
  const stepAt = (href: string | null): AuthStep | undefined => {
    if (href === null) return undefined;
    return AUTH_STEPS.find((candidate) => hrefFor(candidate) === href);
  };

  /**
   * A click on the way up from a screen. If it landed on a link this flow owns,
   * and it is the plain left click a router may take over, the flow navigates
   * itself; anything else — a modified click, a middle click, a link to support
   * or to the terms — is the browser's, untouched.
   */
  const intercept = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement | null)?.closest("a");
    if (!link) return;
    const next = stepAt(link.getAttribute("href"));
    if (next === undefined) return;
    event.preventDefault();
    go(next);
  };

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
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement, event.submitter);
    const address = String(form.get("email") ?? "") || email();

    if (step() === "sign-in") {
      setEmail(address);
      finish(address);
      return;
    }

    if (step() === "sign-up") {
      setEmail(address);
      setResendIn(merged.resendSeconds);
      go("verify");
      return;
    }

    if (step() === "forgot-password") {
      setEmail(address);
      setSent(true);
      return;
    }

    if (step() === "reset-password") {
      const password = String(form.get("password") ?? "");
      const confirmation = String(form.get("confirmPassword") ?? "");
      if (password !== confirmation) {
        setErrors({ confirmPassword: "The two passwords do not match yet." });
        return;
      }
      setToken(String(form.get("token") ?? ""));
      finish(address);
      return;
    }

    if (form.get("intent") === "resend") {
      setResendIn(merged.resendSeconds);
      setResent(true);
      return;
    }
    const code = String(form.get("code") ?? "");
    if (code.length < merged.codeLength) {
      setErrors({ code: `The code is ${merged.codeLength} digits long. Fill every cell.` });
      return;
    }
    finish(address);
  };

  /** A note's own action. Only the stand-in for the email has one here. */
  const noticeAction = (id: string) => {
    if (id !== openTheLink.id) return;
    setToken(token() || "example-token");
    go("reset-password");
  };

  return (
    /*
     * The interactive elements here are the anchors the screens draw, which
     * already answer the keyboard on their own — Enter on a focused link fires
     * this very click. The wrapper is a router's delegated listener, not a
     * control, so it wants no role and no key handler of its own.
     */
    <div class="moderno-flow-auth" onClick={intercept}>
      <Switch>
        <Match when={step() === "sign-in"}>
          <SignIn
            onSubmit={submit}
            forgotHref={hrefFor("forgot-password")}
            signUpHref={hrefFor("sign-up")}
            homeHref={merged.homeHref}
            supportHref={merged.supportHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "sign-up"}>
          <SignUp
            errors={errors()}
            onSubmit={submit}
            signInHref={hrefFor("sign-in")}
            homeHref={merged.homeHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "forgot-password"}>
          <ForgotPassword
            sent={sent()}
            sentTo={email()}
            errors={errors()}
            notices={sent() ? [openTheLink] : undefined}
            onSubmit={submit}
            onNoticeAction={noticeAction}
            signInHref={hrefFor("sign-in")}
            homeHref={merged.homeHref}
            supportHref={merged.supportHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "reset-password"}>
          <ResetPassword
            token={token()}
            errors={errors()}
            onSubmit={submit}
            signInHref={hrefFor("sign-in")}
            homeHref={merged.homeHref}
            supportHref={merged.supportHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "verify"}>
          <Verify
            sentTo={email()}
            codeLength={merged.codeLength}
            resendIn={resendIn()}
            resent={resent()}
            errors={errors()}
            onSubmit={submit}
            signInHref={hrefFor("sign-in")}
            homeHref={merged.homeHref}
            supportHref={merged.supportHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>
      </Switch>
    </div>
  );
}
