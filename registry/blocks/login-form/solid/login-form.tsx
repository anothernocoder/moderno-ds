import { Show } from "solid-js";
import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/solid";

/**
 * LoginForm — the credential card, composed from @moderno-ui/solid primitives
 * (Card, Field, Checkbox, Button, Alert). Copy it into your project with
 * `moderno add login-form-solid` and edit it freely: every visual comes from
 * the token contract, so a theme re-skins it without a diff here.
 *
 * Two modes, one card: `mode="sign-in"` (the default) is the returning person —
 * email, password, remember-me, the recovery link — and `mode="sign-up"` is the
 * new one: full name, email, a new password and the consent that has to be
 * given before an account can exist. One block rather than two, because they
 * are one thing: the same card, the same width, the same rhythm.
 *
 * Presentational: the block owns no credentials, no request and no navigation.
 * Responsive to its container, not the viewport (ADR-0005) — the root declares
 * `@container`, the secondary row stacks below `@sm` (--container-sm) and sits
 * on one line above it, the heading steps up at `@md` (--container-md), and the
 * card never exceeds --container-sm because a credential field wider than that
 * is harder to read, not easier.
 *
 * States: default and empty are the same pristine render (a credential form has
 * no collection to be empty of); hover and focus-visible come from the
 * primitives' own rules; disabled stops the form; loading makes it inert and
 * marks the button aria-busy. Error is where the modes disagree — signing in,
 * `error` raises one form-level Alert and invalidates both credential fields,
 * never "the password is wrong", which would confirm to an attacker that the
 * email exists; signing up, nothing can be leaked yet and `errors` names the
 * field it rejected, keyed by that field's `name`.
 *
 * Class strings are written out in full rather than shared through a variable:
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
  onSubmit?: (event: SubmitEvent) => void;
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

export function LoginForm(props: LoginFormProps) {
  const signUp = () => (props.mode ?? "sign-in") === "sign-up";
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  /**
   * Signing in, one failure invalidates both credential fields and names
   * neither. Signing up, only the field that was actually rejected is marked.
   */
  const invalid = (field: string) =>
    signUp() ? Boolean(props.errors?.[field]) : Boolean(props.error);

  return (
    <section class="@container moderno-block-login text-foreground">
      <Card.Root class="mx-auto w-full max-w-sm">
        <Card.Header>
          <Card.Title class="text-lg @md:text-xl">
            {signUp() ? "Create your account" : "Sign in"}
          </Card.Title>
          <Card.Description>
            {signUp()
              ? "Fourteen days of everything, no card and no sales call."
              : "Enter your email and password to continue."}
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form class="grid gap-5" onSubmit={props.onSubmit} noValidate>
            <Show when={props.error}>
              {(message) => (
                <Alert.Root variant="error" size="sm">
                  <Alert.Content>
                    <Alert.Title>{message()}</Alert.Title>
                  </Alert.Content>
                </Alert.Root>
              )}
            </Show>

            <Show when={signUp()}>
              <Field.Root required invalid={invalid("fullName")} disabled={inert()}>
                <Field.Label>Full name</Field.Label>
                <Field.Input name="fullName" autocomplete="name" placeholder="Ada Lovelace" />
                <Field.ErrorText>{props.errors?.fullName}</Field.ErrorText>
              </Field.Root>
            </Show>

            <Field.Root required invalid={invalid("email")} disabled={inert()}>
              <Field.Label>Email</Field.Label>
              <Field.Input
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
              />
              <Show when={signUp()}>
                <Field.ErrorText>{props.errors?.email}</Field.ErrorText>
              </Show>
            </Field.Root>

            <Field.Root required invalid={invalid("password")} disabled={inert()}>
              <Field.Label>Password</Field.Label>
              <Field.Input
                name="password"
                type="password"
                autocomplete={signUp() ? "new-password" : "current-password"}
                placeholder="••••••••"
              />
              <Show when={signUp()}>
                <Field.HelperText>
                  At least 12 characters. A passphrase beats a puzzle.
                </Field.HelperText>
                <Field.ErrorText>{props.errors?.password}</Field.ErrorText>
              </Show>
            </Field.Root>

            <Show
              when={signUp()}
              fallback={
                <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                  <Checkbox.Root name="remember" size="sm" disabled={inert()}>
                    <Checkbox.Control>
                      <Checkbox.Indicator>✓</Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>Remember me</Checkbox.Label>
                    <Checkbox.HiddenInput />
                  </Checkbox.Root>

                  <a
                    class="rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={props.forgotHref ?? "#"}
                  >
                    Forgot your password?
                  </a>
                </div>
              }
            >
              {/*
                Consent is one checkbox with a short label, and the two legal
                links sit under it rather than inside it: Ark's checkbox root is
                a <label>, so an anchor in the label text is a link inside a
                control — a click either follows it or ticks the box depending
                on the browser, and neither answer is the one the reader meant.
              */}
              <div class="grid gap-2">
                <Checkbox.Root name="terms" size="sm" required disabled={inert()}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>
                <p class="text-sm text-muted-foreground">
                  Read the{" "}
                  <a
                    class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={props.termsHref ?? "#"}
                  >
                    terms of service
                  </a>{" "}
                  and the{" "}
                  <a
                    class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={props.privacyHref ?? "#"}
                  >
                    privacy policy
                  </a>
                  .
                </p>
              </div>
            </Show>

            <Button type="submit" class="w-full" disabled={inert()} aria-busy={props.loading}>
              <Show when={props.loading} fallback={signUp() ? "Create account" : "Sign in"}>
                <span
                  aria-hidden="true"
                  class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                {signUp() ? "Creating account" : "Signing in"}
              </Show>
            </Button>
          </form>
        </Card.Content>

        <Card.Footer class="justify-center">
          <Show
            when={signUp()}
            fallback={
              <p class="text-sm text-muted-foreground">
                New here?{" "}
                <a
                  class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={props.signUpHref ?? "#"}
                >
                  Create an account
                </a>
              </p>
            }
          >
            <p class="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={props.signInHref ?? "#"}
              >
                Sign in
              </a>
            </p>
          </Show>
        </Card.Footer>
      </Card.Root>
    </section>
  );
}
