import type { FormEvent } from "react";
import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/react";

/**
 * LoginForm — the credential card, composed from @moderno-ui/react primitives
 * (Card, Field, Checkbox, Button, Alert). Copy it into your project with
 * `moderno add login-form-react` and edit it freely: every visual comes from
 * the token contract, so a theme re-skins it without a diff here.
 *
 * **Three modes, one card.** `mode="sign-in"` (the default) is the returning
 * person: email, password, remember-me, the recovery link. `mode="sign-up"` is
 * the new one: full name, email, a new password and the consent that has to be
 * given before an account can exist. `mode="forgot-password"` is the one who
 * cannot get in: the address alone, and — once `sent` — the same card
 * confirming the link is on its way. They are one block rather than three
 * because they are one thing — the same card, the same width, the same rhythm
 * — and a person walking the auth flow should not feel the page change under
 * them. The `sign-in`, `sign-up` and `forgot-password` screens each mount this
 * file in one of its modes.
 *
 * **The recovery card confirms in place.** `sent` does not swap the card for a
 * different component: the header rewrites itself, the email field gives way to
 * the sentence explaining what was sent, and the submit becomes a secondary
 * "Send it again" that resubmits the same address — carried in a hidden input,
 * so the resend still works with no JavaScript on the page. Nothing moves, and
 * the reader's eye does not have to find the page again.
 *
 * **Presentational.** The block owns no credentials, no request and no
 * navigation: it takes `error` / `errors` / `loading` / `disabled` and hands the
 * native submit event back. That is what lets the screen above it hold the
 * state while this file stays a section you can drop anywhere.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). The root
 * declares `@container`; the secondary row (remember-me + the recovery link)
 * stacks below `@sm` (`--container-sm`, 24rem) and sits on one line at or above
 * it, and the heading steps up at `@md` (`--container-md`, 36rem) where the
 * section has room to breathe. The card itself never exceeds `--container-sm`,
 * because a credential field wider than that is harder to read, not easier — so
 * the same file is correct in a narrow sidebar, inside a card, and centred on a
 * full-width page, with no media query anywhere.
 *
 * **States.** Default and *empty* are the same pristine render (placeholders,
 * no values) — a credential form has no collection to be empty of. *Hover* and
 * *focus-visible* come from the primitives' own rules in `components.css`; the
 * links here carry the matching pair so the whole block answers a pointer and a
 * keyboard alike. *Disabled* stops the form (an SSO-only workspace, a locked
 * account, a closed beta), and *loading* makes it inert and marks the button
 * `aria-busy`.
 *
 * *Error* is the one place the modes deliberately disagree. Signing in, `error`
 * raises one form-level Alert and marks both credential fields invalid — never
 * "the password is wrong", which would confirm to an attacker that the email
 * exists. Signing up, there is nothing to leak yet and a form that will not say
 * *which* field it rejected is merely rude, so `errors` names them: keyed by
 * the field's `name` (`fullName`, `email`, `password`), each key marking that
 * field invalid and printing its own message. `error` stays the form-level
 * failure — the account could not be created at all, the consent box is
 * unticked, the service is down.
 *
 * Recovering, `errors.email` marks a malformed address, which leaks nothing;
 * but whether the address *has* an account is never told, in this card or in
 * the code behind it. The confirmation is deliberately conditional — "if that
 * address has an account" — because a recovery form that answers differently
 * for a known and an unknown address is an account-enumeration endpoint with a
 * friendly face.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type LoginFormMode = "sign-in" | "sign-up" | "forgot-password";

/**
 * What the card says it is, per mode. The `forgot-password` card rewrites both
 * lines once the link is sent, which is the only copy that is not read straight
 * off this table.
 */
const cardCopy: Record<LoginFormMode, { title: string; description: string }> = {
  "sign-in": {
    title: "Sign in",
    description: "Enter your email and password to continue.",
  },
  "sign-up": {
    title: "Create your account",
    description: "Fourteen days of everything, no card and no sales call.",
  },
  "forgot-password": {
    title: "Reset your password",
    description: "Enter the address you sign in with and we will email you a link.",
  },
};

export interface LoginFormProps {
  /** Which card this is: the returning person, the new one, or the locked-out one. */
  mode?: LoginFormMode;
  /** `forgot-password` only — the link has gone out: the card confirms instead of asking. */
  sent?: boolean;
  /** `forgot-password` only — the address the link went to: named in the confirmation, and resubmitted by "Send it again". */
  sentTo?: string;
  /** Form-level failure message. Renders the alert; in `sign-in` it also invalidates both credential fields. */
  error?: string;
  /** `sign-up` and `forgot-password` — per-field messages keyed by the field's `name`; each marks that field invalid. */
  errors?: Record<string, string>;
  /** The submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** The form is unavailable (SSO-only workspace, locked account, closed beta). */
  disabled?: boolean;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** `sign-in` only — where "Forgot your password?" points. */
  forgotHref?: string;
  /** `sign-in` only — where "Create an account" points. */
  signUpHref?: string;
  /** `sign-up` and `forgot-password` — where "Sign in" points. */
  signInHref?: string;
  /** `sign-up` only — where the terms link under the consent box points. */
  termsHref?: string;
  /** `sign-up` only — where the privacy link under the consent box points. */
  privacyHref?: string;
}

export function LoginForm({
  mode = "sign-in",
  sent = false,
  sentTo = "",
  error,
  errors,
  loading = false,
  disabled = false,
  onSubmit,
  forgotHref = "#",
  signUpHref = "#",
  signInHref = "#",
  termsHref = "#",
  privacyHref = "#",
}: LoginFormProps) {
  const signUp = mode === "sign-up";
  const forgot = mode === "forgot-password";
  /** The confirmation: the recovery card after the link has gone out. */
  const confirming = forgot && sent;
  const inert = loading || disabled;
  /**
   * Signing in, one failure invalidates both credential fields and names
   * neither. In the other two modes only the field that was actually rejected
   * is marked, because there is nothing to leak by saying which one it was.
   */
  const invalid = (field: string) =>
    mode === "sign-in" ? Boolean(error) : Boolean(errors?.[field]);
  const title = confirming ? "Check your inbox" : cardCopy[mode].title;
  const description = confirming
    ? `If ${sentTo || "that address"} has an account, a link to set a new password is on its way.`
    : cardCopy[mode].description;
  const submitLabel = confirming
    ? "Send it again"
    : forgot
      ? "Send reset link"
      : signUp
        ? "Create account"
        : "Sign in";
  const busyLabel = forgot ? "Sending link" : signUp ? "Creating account" : "Signing in";

  return (
    <section className="@container moderno-block-login text-foreground">
      <Card.Root className="mx-auto w-full max-w-sm">
        <Card.Header>
          <Card.Title className="text-lg @md:text-xl">{title}</Card.Title>
          <Card.Description>{description}</Card.Description>
        </Card.Header>

        <Card.Content>
          <form className="grid gap-5" onSubmit={onSubmit} noValidate>
            {error ? (
              <Alert.Root variant="error" size="sm">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Content>
              </Alert.Root>
            ) : null}

            {confirming ? (
              /*
               * The address travels with the resend in a hidden input rather
               * than in a closure: "Send it again" is then a plain form
               * submission, which still works on a page whose JavaScript never
               * arrived — the same reason the recovery link itself is an
               * `href`.
               */
              <input type="hidden" name="email" value={sentTo} />
            ) : null}

            {confirming ? (
              <p className="text-sm text-muted-foreground">
                The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
                spam, then send it again.
              </p>
            ) : null}

            {signUp ? (
              <Field.Root required invalid={invalid("fullName")} disabled={inert}>
                <Field.Label>Full name</Field.Label>
                <Field.Input name="fullName" autoComplete="name" placeholder="Ada Lovelace" />
                <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
              </Field.Root>
            ) : null}

            {confirming ? null : (
              <Field.Root required invalid={invalid("email")} disabled={inert}>
                <Field.Label>Email</Field.Label>
                <Field.Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {signUp || forgot ? <Field.ErrorText>{errors?.email}</Field.ErrorText> : null}
              </Field.Root>
            )}

            {forgot ? null : (
              <Field.Root required invalid={invalid("password")} disabled={inert}>
                <Field.Label>Password</Field.Label>
                <Field.Input
                  name="password"
                  type="password"
                  autoComplete={signUp ? "new-password" : "current-password"}
                  placeholder="••••••••"
                />
                {signUp ? (
                  <>
                    <Field.HelperText>
                      At least 12 characters. A passphrase beats a puzzle.
                    </Field.HelperText>
                    <Field.ErrorText>{errors?.password}</Field.ErrorText>
                  </>
                ) : null}
              </Field.Root>
            )}

            {forgot ? null : signUp ? (
              /*
               * Consent is one checkbox with a short label, and the two legal
               * links sit *under* it rather than inside it: Ark's checkbox root
               * is a `<label>`, so an anchor in the label text is a link inside
               * a control — a click either follows it or ticks the box
               * depending on the browser, and neither answer is the one the
               * reader meant.
               */
              <div className="grid gap-2">
                <Checkbox.Root name="terms" size="sm" required disabled={inert}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>
                <p className="text-sm text-muted-foreground">
                  Read the{" "}
                  <a
                    className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={termsHref}
                  >
                    terms of service
                  </a>{" "}
                  and the{" "}
                  <a
                    className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={privacyHref}
                  >
                    privacy policy
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                <Checkbox.Root name="remember" size="sm" disabled={inert}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>Remember me</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>

                <a
                  className="rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={forgotHref}
                >
                  Forgot your password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              variant={confirming ? "secondary" : "primary"}
              className="w-full"
              disabled={inert}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  />
                  {busyLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        </Card.Content>

        <Card.Footer className="justify-center">
          {signUp || forgot ? (
            <p className="text-sm text-muted-foreground">
              {forgot ? "Remembered it?" : "Already have an account?"}{" "}
              <a
                className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={signInHref}
              >
                Sign in
              </a>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              New here?{" "}
              <a
                className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={signUpHref}
              >
                Create an account
              </a>
            </p>
          )}
        </Card.Footer>
      </Card.Root>
    </section>
  );
}
