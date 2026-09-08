import type { FormEvent } from "react";
import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/react";

/**
 * LoginForm — the credential card, composed from @moderno-ui/react primitives
 * (Card, Field, Checkbox, Button, Alert). Copy it into your project with
 * `moderno add login-form-react` and edit it freely: every visual comes from
 * the token contract, so a theme re-skins it without a diff here.
 *
 * **Two modes, one card.** `mode="sign-in"` (the default) is the returning
 * person: email, password, remember-me, the recovery link. `mode="sign-up"` is
 * the new one: full name, email, a new password and the consent that has to be
 * given before an account can exist. They are one block rather than two because
 * they are one thing — the same card, the same width, the same rhythm — and a
 * person moving between them should not feel the page change under them. The
 * `sign-in` and `sign-up` screens each mount this file in one of its modes.
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
 * *Error* is the one place the two modes deliberately disagree. Signing in,
 * `error` raises one form-level Alert and marks both credential fields invalid
 * — never "the password is wrong", which would confirm to an attacker that the
 * email exists. Signing up, there is nothing to leak yet and a form that will
 * not say *which* field it rejected is merely rude, so `errors` names them:
 * keyed by the field's `name` (`fullName`, `email`, `password`), each key
 * marking that field invalid and printing its own message. `error` stays the
 * form-level failure — the account could not be created at all, the consent box
 * is unticked, the service is down.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type LoginFormMode = "sign-in" | "sign-up";

export interface LoginFormProps {
  /** Which card this is: the returning person, or the new one. */
  mode?: LoginFormMode;
  /** Form-level failure message. Renders the alert; in `sign-in` it also invalidates both credential fields. */
  error?: string;
  /** `sign-up` only — per-field messages keyed by the field's `name`; each marks that field invalid. */
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
  /** `sign-up` only — where "Sign in" points. */
  signInHref?: string;
  /** `sign-up` only — where the terms link under the consent box points. */
  termsHref?: string;
  /** `sign-up` only — where the privacy link under the consent box points. */
  privacyHref?: string;
}

export function LoginForm({
  mode = "sign-in",
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
  const inert = loading || disabled;
  /**
   * Signing in, one failure invalidates both credential fields and names
   * neither. Signing up, only the field that was actually rejected is marked.
   */
  const invalid = (field: string) => (signUp ? Boolean(errors?.[field]) : Boolean(error));

  return (
    <section className="@container moderno-block-login text-foreground">
      <Card.Root className="mx-auto w-full max-w-sm">
        <Card.Header>
          <Card.Title className="text-lg @md:text-xl">
            {signUp ? "Create your account" : "Sign in"}
          </Card.Title>
          <Card.Description>
            {signUp
              ? "Fourteen days of everything, no card and no sales call."
              : "Enter your email and password to continue."}
          </Card.Description>
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

            {signUp ? (
              <Field.Root required invalid={invalid("fullName")} disabled={inert}>
                <Field.Label>Full name</Field.Label>
                <Field.Input name="fullName" autoComplete="name" placeholder="Ada Lovelace" />
                <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
              </Field.Root>
            ) : null}

            <Field.Root required invalid={invalid("email")} disabled={inert}>
              <Field.Label>Email</Field.Label>
              <Field.Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
              {signUp ? <Field.ErrorText>{errors?.email}</Field.ErrorText> : null}
            </Field.Root>

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

            {signUp ? (
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

            <Button type="submit" className="w-full" disabled={inert} aria-busy={loading}>
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  />
                  {signUp ? "Creating account" : "Signing in"}
                </>
              ) : signUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Card.Content>

        <Card.Footer className="justify-center">
          {signUp ? (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
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
