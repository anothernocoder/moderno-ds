import { For, Show } from "solid-js";
import { Alert, Button, Card, Checkbox, Field, PinInput } from "@moderno-ui/solid";

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
  onSubmit?: (event: SubmitEvent) => void;
  forgotHref?: string;
  signUpHref?: string;
  signInHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

export function LoginForm(props: LoginFormProps) {
  const mode = () => props.mode ?? "sign-in";
  const titleLevel = () => props.titleLevel ?? 3;
  const signUp = () => mode() === "sign-up";
  const forgot = () => mode() === "forgot-password";
  const reset = () => mode() === "reset-password";
  const verify = () => mode() === "verify";
  const confirming = () => forgot() && Boolean(props.sent);
  const asksForEmail = () => !confirming() && !reset() && !verify();
  const cells = () =>
    Array.from({ length: Math.max(1, Math.trunc(props.codeLength ?? 6)) }, (_, index) => index);
  const waiting = () => verify() && (props.resendIn ?? 0) > 0;
  const newPassword = () => signUp() || reset();
  const requirements = () => props.requirements ?? defaultRequirements;
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  const invalid = (field: string) =>
    mode() === "sign-in" ? Boolean(props.error) : Boolean(props.errors?.[field]);
  const title = () => (confirming() ? "Check your inbox" : cardCopy[mode()].title);
  const verifyDescription = () =>
    props.resent
      ? `A new code is on its way to ${props.sentTo || "your inbox"}. The one before it has stopped working.`
      : props.sentTo
        ? `Enter the ${cells().length}-digit code we sent to ${props.sentTo}.`
        : cardCopy.verify.description;
  const description = () =>
    confirming()
      ? `If ${props.sentTo || "that address"} has an account, a link to set a new password is on its way.`
      : verify()
        ? verifyDescription()
        : cardCopy[mode()].description;
  const submitLabel = () => (confirming() ? "Send it again" : cardCopy[mode()].submit);
  const busyLabel = () => cardCopy[mode()].busy;

  return (
    <section class="@container moderno-block-login text-foreground">
      <Card.Root class="mx-auto w-full max-w-sm">
        <Card.Header role={forgot() || verify() ? "status" : undefined}>
          <Card.Title
            class="text-body-lg @md:text-heading-sm"
            aria-level={titleLevel() === 3 ? undefined : titleLevel()}
          >
            {title()}
          </Card.Title>
          <Card.Description>{description()}</Card.Description>
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

            <Show when={reset() && props.token}>
              <input type="hidden" name="token" value={props.token ?? ""} />
            </Show>

            <Show when={confirming()}>
              <input type="hidden" name="email" value={props.sentTo ?? ""} />
              <p class="text-ui-md text-muted-foreground">
                The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
                spam, then send it again.
              </p>
            </Show>

            <Show when={verify() && props.sentTo}>
              <input type="hidden" name="email" value={props.sentTo ?? ""} />
            </Show>

            <Show when={verify()}>
              <div class="grid gap-2">
                <PinInput.Root
                  name="code"
                  count={cells().length}
                  otp
                  required
                  disabled={inert()}
                  invalid={invalid("code")}
                >
                  <PinInput.Label>Verification code</PinInput.Label>
                  <PinInput.Control>
                    <For each={cells()}>{(index) => <PinInput.Input index={index} />}</For>
                  </PinInput.Control>
                  <PinInput.HiddenInput />
                </PinInput.Root>
                <Show when={props.errors?.code}>
                  {(message) => (
                    <p class="text-ui-md text-destructive" role="alert">
                      {message()}
                    </p>
                  )}
                </Show>
              </div>
            </Show>

            <Show when={signUp()}>
              <Field.Root required invalid={invalid("fullName")} disabled={inert()}>
                <Field.Label>Full name</Field.Label>
                <Field.Input name="fullName" autocomplete="name" placeholder="Ada Lovelace" />
                <Field.ErrorText>{props.errors?.fullName}</Field.ErrorText>
              </Field.Root>
            </Show>

            <Show when={asksForEmail()}>
              <Field.Root required invalid={invalid("email")} disabled={inert()}>
                <Field.Label>Email</Field.Label>
                <Field.Input
                  name="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                />
                <Show when={signUp() || forgot()}>
                  <Field.ErrorText>{props.errors?.email}</Field.ErrorText>
                </Show>
              </Field.Root>
            </Show>

            <Show when={!forgot() && !verify()}>
              <Field.Root required invalid={invalid("password")} disabled={inert()}>
                <Field.Label>{reset() ? "New password" : "Password"}</Field.Label>
                <Field.Input
                  name="password"
                  type="password"
                  autocomplete={newPassword() ? "new-password" : "current-password"}
                  placeholder="••••••••"
                />
                <Show
                  when={reset() && requirements().length > 0}
                  fallback={
                    <Show when={newPassword()}>
                      <Field.HelperText>
                        At least 12 characters. A passphrase beats a puzzle.
                      </Field.HelperText>
                    </Show>
                  }
                >
                  <Field.HelperText class="grid gap-1" role="list" aria-live="polite">
                    <For each={requirements()}>
                      {(requirement) => (
                        <span role="listitem" class="flex items-center gap-2">
                          <span aria-hidden="true">{requirement.met ? "✓" : "○"}</span>
                          <span class={requirement.met ? "text-foreground" : undefined}>
                            {requirement.label}
                          </span>
                          <span class="sr-only">{requirement.met ? "— met" : "— not met yet"}</span>
                        </span>
                      )}
                    </For>
                  </Field.HelperText>
                </Show>
                <Show when={newPassword()}>
                  <Field.ErrorText>{props.errors?.password}</Field.ErrorText>
                </Show>
              </Field.Root>
            </Show>

            <Show when={reset()}>
              <Field.Root required invalid={invalid("confirmPassword")} disabled={inert()}>
                <Field.Label>Confirm new password</Field.Label>
                <Field.Input
                  name="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  placeholder="••••••••"
                />
                <Field.ErrorText>{props.errors?.confirmPassword}</Field.ErrorText>
              </Field.Root>
            </Show>

            <Show
              when={signUp()}
              fallback={
                <Show when={!forgot() && !reset() && !verify()}>
                  <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                    <Checkbox.Root name="remember" size="sm" disabled={inert()}>
                      <Checkbox.Control>
                        <Checkbox.Indicator>✓</Checkbox.Indicator>
                      </Checkbox.Control>
                      <Checkbox.Label>Remember me</Checkbox.Label>
                      <Checkbox.HiddenInput />
                    </Checkbox.Root>

                    <a
                      class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={props.forgotHref ?? "#"}
                    >
                      Forgot your password?
                    </a>
                  </div>
                </Show>
              }
            >
              <div class="grid gap-2">
                <Checkbox.Root name="terms" size="sm" required disabled={inert()}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>
                <p class="text-ui-md text-muted-foreground">
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

            <Button
              type="submit"
              variant={confirming() ? "secondary" : "primary"}
              class="w-full"
              disabled={inert()}
              aria-busy={props.loading}
            >
              <Show when={props.loading} fallback={submitLabel()}>
                <span
                  aria-hidden="true"
                  class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                {busyLabel()}
              </Show>
            </Button>

            <Show when={verify()}>
              <Button
                type="submit"
                name="intent"
                value="resend"
                variant="ghost"
                class="w-full"
                disabled={inert() || waiting()}
              >
                {waiting() ? `Send a new code in ${props.resendIn}s` : "Send a new code"}
              </Button>
            </Show>
          </form>
        </Card.Content>

        <Card.Footer class="justify-center">
          <p class="text-ui-md text-muted-foreground">
            {cardCopy[mode()].footerPrompt}{" "}
            <a
              class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={mode() === "sign-in" ? (props.signUpHref ?? "#") : (props.signInHref ?? "#")}
            >
              {mode() === "sign-in" ? "Create an account" : "Sign in"}
            </a>
          </p>
        </Card.Footer>
      </Card.Root>
    </section>
  );
}
