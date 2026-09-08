import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { ForgotPassword, type ForgotPasswordProps } from "@/components/screens/forgot-password";
import { ResetPassword } from "@/components/screens/reset-password";
import { SignIn } from "@/components/screens/sign-in";
import { SignUp } from "@/components/screens/sign-up";
import { Verify } from "@/components/screens/verify";

/**
 * AuthFlow — the example assembly for the `auth` flow: sign-in → sign-up →
 * forgot-password → reset-password → verify, and the navigation state between
 * them. Copy it into your project with `moderno add auth-react`; the five
 * screens and the blocks they compose arrive with it, and every file is yours
 * from that moment.
 *
 * **This is the piece you are expected to rewrite.** Every screen under it is
 * presentational on purpose — props in, callbacks out, no step, no router, no
 * timer — which leaves exactly one question open: what comes after what. That
 * question has a different answer in every application, so the design system
 * answers it once, in a file whose whole job is to be replaced by yours. The
 * screens are the product; this is the worked example.
 *
 * **What it owns**, and what the screens deliberately do not:
 *
 * - `step` — which of the five screens is on the route right now.
 * - `email` — the address, carried from wherever it was typed to wherever it is
 *   named next (the sign-up form to the code card, the recovery form to its own
 *   confirmation).
 * - `token` — the secret out of the emailed reset link.
 * - `resendIn` — the seconds left on the verify screen's resend, ticked down by
 *   the one `setTimeout` in the whole flow. The card renders that number; it
 *   never runs a clock, because a block that owned a timer would own state.
 * - `errors` — whatever the last submit rejected, cleared on every step change.
 *
 * **Navigation is link interception, not callbacks.** Every route between two
 * screens is an `href` the card or the masthead draws — "Create an account",
 * "Forgot your password?", "Sign in" — because a link out of a sign-in page has
 * to work on a page whose JavaScript never arrived, which is precisely the
 * moment someone is locked out. So the assembly hands each screen the URLs it
 * should point at (`hrefFor`) and catches the clicks on the way up, exactly as
 * a client router does: modified clicks and middle clicks are left to the
 * browser, and an `href` that is not one of the flow's own is left alone.
 * Swap `hrefFor` for your router's URLs and the markup needs no other change.
 *
 * ```tsx
 * <AuthFlow
 *   hrefFor={(step) => `/auth/${step}`}
 *   initialStep={stepFromUrl}
 *   onStepChange={(step) => router.push(`/auth/${step}`)}
 *   onAuthenticated={(email) => router.push("/")}
 * />
 * ```
 *
 * **Forward moves are form submissions.** Each screen posts a plain `<form>`;
 * the assembly reads it with `new FormData(form, submitter)` — the submitter
 * matters on `verify`, where the resend is a second submit rather than a
 * callback — and decides where that leaves the reader. Replace the bodies of
 * `submit` with your own requests and the shape of the flow survives intact.
 *
 * **The one edge it cannot own is the email.** `reset-password` is reached in
 * real life by opening a link in an inbox, i.e. by *entering* the flow at that
 * step with a token out of the URL — which is what `initialStep` and
 * `resetToken` are for. With no mail server behind an example, the confirmation
 * offers the link as a notice instead; deleting that notice and the branch of
 * `noticeAction` it feeds is the first edit most projects will make.
 *
 * **Where the flow ends.** A finished sign-in, a checked code and a saved
 * password all call `onAuthenticated` with the address and return to the first
 * step. They do not clear the form or paint a success page: at that point your
 * router is expected to leave, and a flow that drew its own "you are in" screen
 * would be holding a sixth screen nobody can install.
 */
export type AuthStep = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

/** The flow, in order. The index is what `hrefFor` is asked about. */
export const AUTH_STEPS: readonly AuthStep[] = [
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "verify",
];

/** One row of the notes a screen shows beside its card, as its block renders them. */
type Notice = NonNullable<ForgotPasswordProps["notices"]>[number];

/**
 * The stand-in for the email, and the only thing in this file that exists
 * because an example has no server. In your product the reader leaves for their
 * inbox here and comes back on a URL, so this row goes away and
 * `initialStep="reset-password"` takes over.
 */
const openTheLink: Notice = {
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

export function AuthFlow({
  initialStep = "sign-in",
  initialEmail = "",
  resetToken = "",
  resendSeconds = 30,
  codeLength = 6,
  hrefFor = (step) => `#${step}`,
  onStepChange,
  onAuthenticated,
  homeHref = "#",
  supportHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(resetToken);
  const [sent, setSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resent, setResent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string> | undefined>(undefined);

  /**
   * The flow's clock, and the reason the verify card can stay stateless: one
   * timeout per second while the resend is locked, cleared on every change and
   * on unmount. Nothing below this component knows the time is passing.
   */
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((left) => Math.max(0, left - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  function go(next: AuthStep) {
    setStep(next);
    setErrors(undefined);
    onStepChange?.(next);
  }

  /** The flow's exit: the address goes up, and the reader goes wherever you send them. */
  function finish(address: string) {
    setSent(false);
    setResendIn(0);
    setResent(false);
    onAuthenticated?.(address);
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
   * itself; anything else — a modified click, a middle click, a link to
   * support or to the terms — is the browser's, untouched.
   */
  function intercept(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement | null)?.closest("a");
    if (link === null || link === undefined) return;
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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    const address = String(form.get("email") ?? "") || email;

    switch (step) {
      case "sign-in":
        setEmail(address);
        finish(address);
        return;

      case "sign-up":
        setEmail(address);
        setResendIn(resendSeconds);
        setResent(false);
        go("verify");
        return;

      case "forgot-password":
        setEmail(address);
        setSent(true);
        return;

      case "reset-password": {
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

      case "verify": {
        if (form.get("intent") === "resend") {
          setResendIn(resendSeconds);
          setResent(true);
          return;
        }
        const code = String(form.get("code") ?? "");
        if (code.length < codeLength) {
          setErrors({ code: `The code is ${codeLength} digits long. Fill every cell.` });
          return;
        }
        finish(address);
        return;
      }
    }
  }

  /** A note's own action. Only the stand-in for the email has one here. */
  function noticeAction(id: string) {
    if (id !== openTheLink.id) return;
    setToken(token || "example-token");
    setSent(false);
    go("reset-password");
  }

  return (
    <div className="moderno-flow-auth" onClick={intercept}>
      {step === "sign-in" ? (
        <SignIn
          onSubmit={submit}
          forgotHref={hrefFor("forgot-password")}
          signUpHref={hrefFor("sign-up")}
          homeHref={homeHref}
          supportHref={supportHref}
          privacyHref={privacyHref}
          termsHref={termsHref}
        />
      ) : null}

      {step === "sign-up" ? (
        <SignUp
          errors={errors}
          onSubmit={submit}
          signInHref={hrefFor("sign-in")}
          homeHref={homeHref}
          privacyHref={privacyHref}
          termsHref={termsHref}
        />
      ) : null}

      {step === "forgot-password" ? (
        <ForgotPassword
          sent={sent}
          sentTo={email}
          errors={errors}
          notices={sent ? [openTheLink] : undefined}
          onSubmit={submit}
          onNoticeAction={noticeAction}
          signInHref={hrefFor("sign-in")}
          homeHref={homeHref}
          supportHref={supportHref}
          privacyHref={privacyHref}
          termsHref={termsHref}
        />
      ) : null}

      {step === "reset-password" ? (
        <ResetPassword
          token={token}
          errors={errors}
          onSubmit={submit}
          signInHref={hrefFor("sign-in")}
          homeHref={homeHref}
          supportHref={supportHref}
          privacyHref={privacyHref}
          termsHref={termsHref}
        />
      ) : null}

      {step === "verify" ? (
        <Verify
          sentTo={email}
          codeLength={codeLength}
          resendIn={resendIn}
          resent={resent}
          errors={errors}
          onSubmit={submit}
          signInHref={hrefFor("sign-in")}
          homeHref={homeHref}
          supportHref={supportHref}
          privacyHref={privacyHref}
          termsHref={termsHref}
        />
      ) : null}
    </div>
  );
}
