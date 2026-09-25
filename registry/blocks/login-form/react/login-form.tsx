import type { FormEvent } from "react";
import { Alert, Button, Card, Checkbox, Field, PinInput } from "@moderno-ui/react";

export type LoginFormMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

export interface PasswordRequirement {
  id: string;
  label: string;
  met?: boolean;
}

const cardCopy: Record<
  LoginFormMode,
  { title: string; description: string; submit: string; busy: string; footerPrompt: string }
> = {
  "sign-in": {
    title: "Sign in",
    description: "Enter your email and password to continue.",
    submit: "Sign in",
    busy: "Signing in",
    footerPrompt: "New here?",
  },
  "sign-up": {
    title: "Create your account",
    description: "Fourteen days of everything, no card and no sales call.",
    submit: "Create account",
    busy: "Creating account",
    footerPrompt: "Already have an account?",
  },
  "forgot-password": {
    title: "Reset your password",
    description: "Enter the address you sign in with and we will email you a link.",
    submit: "Send reset link",
    busy: "Sending link",
    footerPrompt: "Remembered it?",
  },
  "reset-password": {
    title: "Choose a new password",
    description: "Pick one you have not used here before. It replaces the old one everywhere.",
    submit: "Set new password",
    busy: "Saving password",
    footerPrompt: "Changed your mind?",
  },
  verify: {
    title: "Enter your code",
    description: "Type the code we sent, so we know the address is yours.",
    submit: "Verify email",
    busy: "Verifying",
    footerPrompt: "Wrong account?",
  },
};

const defaultRequirements: PasswordRequirement[] = [
  { id: "length", label: "At least 12 characters" },
  { id: "case", label: "An upper and a lower case letter" },
  { id: "symbol", label: "A number or a symbol" },
];

export interface LoginFormProps {
  mode?: LoginFormMode;
  titleLevel?: 1 | 2 | 3;
  sent?: boolean;
  sentTo?: string;
  codeLength?: number;
  resendIn?: number;
  resent?: boolean;
  token?: string;
  requirements?: PasswordRequirement[];
  error?: string;
  errors?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  forgotHref?: string;
  signUpHref?: string;
  signInHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

export function LoginForm({
  mode = "sign-in",
  titleLevel = 3,
  sent = false,
  sentTo = "",
  codeLength = 6,
  resendIn = 0,
  resent = false,
  token = "",
  requirements = defaultRequirements,
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
  const reset = mode === "reset-password";
  const verify = mode === "verify";
  const confirming = forgot && sent;
  const asksForEmail = !confirming && !reset && !verify;
  const newPassword = signUp || reset;
  const inert = loading || disabled;
  const cells = Array.from({ length: Math.max(1, Math.trunc(codeLength)) }, (_, index) => index);
  const waiting = verify && resendIn > 0;
  const invalid = (field: string) =>
    mode === "sign-in" ? Boolean(error) : Boolean(errors?.[field]);
  const title = confirming ? "Check your inbox" : cardCopy[mode].title;
  const verifyDescription = resent
    ? `A new code is on its way to ${sentTo || "your inbox"}. The one before it has stopped working.`
    : sentTo
      ? `Enter the ${cells.length}-digit code we sent to ${sentTo}.`
      : cardCopy.verify.description;
  const description = confirming
    ? `If ${sentTo || "that address"} has an account, a link to set a new password is on its way.`
    : verify
      ? verifyDescription
      : cardCopy[mode].description;
  const submitLabel = confirming ? "Send it again" : cardCopy[mode].submit;
  const busyLabel = cardCopy[mode].busy;

  return (
    <section className="@container moderno-block-login text-foreground">
      <Card.Root className="mx-auto w-full max-w-sm">
        <Card.Header role={forgot || verify ? "status" : undefined}>
          <Card.Title
            className="text-body-lg @md:text-heading-sm"
            aria-level={titleLevel === 3 ? undefined : titleLevel}
          >
            {title}
          </Card.Title>
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

            {confirming ? <input type="hidden" name="email" value={sentTo} /> : null}

            {reset && token ? <input type="hidden" name="token" value={token} /> : null}

            {confirming ? (
              <p className="text-ui-md text-muted-foreground">
                The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
                spam, then send it again.
              </p>
            ) : null}

            {verify && sentTo ? <input type="hidden" name="email" value={sentTo} /> : null}

            {verify ? (
              <div className="grid gap-2">
                <PinInput.Root
                  name="code"
                  count={cells.length}
                  otp
                  required
                  disabled={inert}
                  invalid={invalid("code")}
                >
                  <PinInput.Label>Verification code</PinInput.Label>
                  <PinInput.Control>
                    {cells.map((index) => (
                      <PinInput.Input key={index} index={index} />
                    ))}
                  </PinInput.Control>
                  <PinInput.HiddenInput />
                </PinInput.Root>
                {errors?.code ? (
                  <p className="text-ui-md text-destructive" role="alert">
                    {errors.code}
                  </p>
                ) : null}
              </div>
            ) : null}

            {signUp ? (
              <Field.Root required invalid={invalid("fullName")} disabled={inert}>
                <Field.Label>Full name</Field.Label>
                <Field.Input name="fullName" autoComplete="name" placeholder="Ada Lovelace" />
                <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
              </Field.Root>
            ) : null}

            {asksForEmail ? (
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
            ) : null}

            {forgot || verify ? null : (
              <Field.Root required invalid={invalid("password")} disabled={inert}>
                <Field.Label>{reset ? "New password" : "Password"}</Field.Label>
                <Field.Input
                  name="password"
                  type="password"
                  autoComplete={newPassword ? "new-password" : "current-password"}
                  placeholder="••••••••"
                />
                {reset && requirements.length > 0 ? (
                  <Field.HelperText className="grid gap-1" role="list" aria-live="polite">
                    {requirements.map((requirement) => (
                      <span
                        key={requirement.id}
                        role="listitem"
                        className="flex items-center gap-2"
                      >
                        <span aria-hidden="true">{requirement.met ? "✓" : "○"}</span>
                        <span className={requirement.met ? "text-foreground" : undefined}>
                          {requirement.label}
                        </span>
                        <span className="sr-only">
                          {requirement.met ? "— met" : "— not met yet"}
                        </span>
                      </span>
                    ))}
                  </Field.HelperText>
                ) : newPassword ? (
                  <Field.HelperText>
                    At least 12 characters. A passphrase beats a puzzle.
                  </Field.HelperText>
                ) : null}
                {newPassword ? <Field.ErrorText>{errors?.password}</Field.ErrorText> : null}
              </Field.Root>
            )}

            {reset ? (
              <Field.Root required invalid={invalid("confirmPassword")} disabled={inert}>
                <Field.Label>Confirm new password</Field.Label>
                <Field.Input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <Field.ErrorText>{errors?.confirmPassword}</Field.ErrorText>
              </Field.Root>
            ) : null}

            {forgot || reset || verify ? null : signUp ? (
              <div className="grid gap-2">
                <Checkbox.Root name="terms" size="sm" required disabled={inert}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>
                <p className="text-ui-md text-muted-foreground">
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
                  className="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

            {verify ? (
              <Button
                type="submit"
                name="intent"
                value="resend"
                variant="ghost"
                className="w-full"
                disabled={inert || waiting}
              >
                {waiting ? `Send a new code in ${resendIn}s` : "Send a new code"}
              </Button>
            ) : null}
          </form>
        </Card.Content>

        <Card.Footer className="justify-center">
          <p className="text-ui-md text-muted-foreground">
            {cardCopy[mode].footerPrompt}{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={mode === "sign-in" ? signUpHref : signInHref}
            >
              {mode === "sign-in" ? "Create an account" : "Sign in"}
            </a>
          </p>
        </Card.Footer>
      </Card.Root>
    </section>
  );
}
