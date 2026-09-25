<script lang="ts">
  import { Alert, Button, Card, Checkbox, Field, PinInput } from "@moderno-ui/svelte";

  type Mode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify";

  interface PasswordRequirement {
    id: string;
    label: string;
    met?: boolean;
  }

  const cardCopy: Record<
    Mode,
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

  interface Props {
    mode?: Mode;
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
    onsubmit?: (event: SubmitEvent) => void;
    forgotHref?: string;
    signUpHref?: string;
    signInHref?: string;
    termsHref?: string;
    privacyHref?: string;
  }

  let {
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
    onsubmit,
    forgotHref = "#",
    signUpHref = "#",
    signInHref = "#",
    termsHref = "#",
    privacyHref = "#",
  }: Props = $props();

  const signUp = $derived(mode === "sign-up");
  const forgot = $derived(mode === "forgot-password");
  const reset = $derived(mode === "reset-password");
  const verify = $derived(mode === "verify");
  const confirming = $derived(forgot && sent);
  const asksForEmail = $derived(!confirming && !reset && !verify);
  const newPassword = $derived(signUp || reset);
  const inert = $derived(loading || disabled);
  const cells = $derived(
    Array.from({ length: Math.max(1, Math.trunc(codeLength)) }, (_, index) => index),
  );
  const waiting = $derived(verify && resendIn > 0);
  const invalid = (field: string) =>
    mode === "sign-in" ? Boolean(error) : Boolean(errors?.[field]);
  const title = $derived(confirming ? "Check your inbox" : cardCopy[mode].title);
  const verifyDescription = $derived(
    resent
      ? `A new code is on its way to ${sentTo || "your inbox"}. The one before it has stopped working.`
      : sentTo
        ? `Enter the ${cells.length}-digit code we sent to ${sentTo}.`
        : cardCopy.verify.description,
  );
  const description = $derived(
    confirming
      ? `If ${sentTo || "that address"} has an account, a link to set a new password is on its way.`
      : verify
        ? verifyDescription
        : cardCopy[mode].description,
  );
  const submitLabel = $derived(confirming ? "Send it again" : cardCopy[mode].submit);
  const busyLabel = $derived(cardCopy[mode].busy);
</script>

<section class="@container moderno-block-login text-foreground">
  <Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header role={forgot || verify ? "status" : undefined}>
      <Card.Title class="text-lg @md:text-xl" aria-level={titleLevel === 3 ? undefined : titleLevel}>
        {title}
      </Card.Title>
      <Card.Description>{description}</Card.Description>
    </Card.Header>

    <Card.Content>
      <form class="grid gap-5" {onsubmit} novalidate>
        {#if error}
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        {/if}

        {#if reset && token}
          <input type="hidden" name="token" value={token} />
        {/if}

        {#if confirming}
          <input type="hidden" name="email" value={sentTo} />
          <p class="text-sm text-muted-foreground">
            The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
            spam, then send it again.
          </p>
        {/if}

        {#if verify && sentTo}
          <input type="hidden" name="email" value={sentTo} />
        {/if}

        {#if verify}
          <div class="grid gap-2">
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
                {#each cells as index (index)}
                  <PinInput.Input {index} />
                {/each}
              </PinInput.Control>
              <PinInput.HiddenInput />
            </PinInput.Root>
            {#if errors?.code}
              <p class="text-sm text-destructive" role="alert">{errors.code}</p>
            {/if}
          </div>
        {/if}

        {#if signUp}
          <Field.Root required invalid={invalid("fullName")} disabled={inert}>
            <Field.Label>Full name</Field.Label>
            <Field.Input name="fullName" autocomplete="name" placeholder="Ada Lovelace" />
            <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
          </Field.Root>
        {/if}

        {#if asksForEmail}
          <Field.Root required invalid={invalid("email")} disabled={inert}>
            <Field.Label>Email</Field.Label>
            <Field.Input
              name="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
            />
            {#if signUp || forgot}
              <Field.ErrorText>{errors?.email}</Field.ErrorText>
            {/if}
          </Field.Root>
        {/if}

        {#if !forgot && !verify}
          <Field.Root required invalid={invalid("password")} disabled={inert}>
            <Field.Label>{reset ? "New password" : "Password"}</Field.Label>
            <Field.Input
              name="password"
              type="password"
              autocomplete={newPassword ? "new-password" : "current-password"}
              placeholder="••••••••"
            />
            {#if reset && requirements.length > 0}
              <Field.HelperText class="grid gap-1" role="list" aria-live="polite">
                {#each requirements as requirement (requirement.id)}
                  <span role="listitem" class="flex items-center gap-2">
                    <span aria-hidden="true">{requirement.met ? "✓" : "○"}</span>
                    <span class={requirement.met ? "text-foreground" : undefined}>
                      {requirement.label}
                    </span>
                    <span class="sr-only">{requirement.met ? "— met" : "— not met yet"}</span>
                  </span>
                {/each}
              </Field.HelperText>
            {:else if newPassword}
              <Field.HelperText>
                At least 12 characters. A passphrase beats a puzzle.
              </Field.HelperText>
            {/if}
            {#if newPassword}
              <Field.ErrorText>{errors?.password}</Field.ErrorText>
            {/if}
          </Field.Root>
        {/if}

        {#if reset}
          <Field.Root required invalid={invalid("confirmPassword")} disabled={inert}>
            <Field.Label>Confirm new password</Field.Label>
            <Field.Input
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
            />
            <Field.ErrorText>{errors?.confirmPassword}</Field.ErrorText>
          </Field.Root>
        {/if}

        {#if signUp}
          <div class="grid gap-2">
            <Checkbox.Root name="terms" size="sm" required disabled={inert}>
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
            <p class="text-sm text-muted-foreground">
              Read the
              <a
                class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={termsHref}
              >
                terms of service
              </a>
              and the
              <a
                class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={privacyHref}
              >
                privacy policy
              </a>.
            </p>
          </div>
        {:else if !forgot && !reset && !verify}
          <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
            <Checkbox.Root name="remember" size="sm" disabled={inert}>
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Remember me</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>

            <a
              class="rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={forgotHref}
            >
              Forgot your password?
            </a>
          </div>
        {/if}

        <Button
          type="submit"
          variant={confirming ? "secondary" : "primary"}
          class="w-full"
          disabled={inert}
          aria-busy={loading}
        >
          {#if loading}
            <span
              aria-hidden="true"
              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            ></span>
            {busyLabel}
          {:else}
            {submitLabel}
          {/if}
        </Button>

        {#if verify}
          <Button
            type="submit"
            name="intent"
            value="resend"
            variant="ghost"
            class="w-full"
            disabled={inert || waiting}
          >
            {waiting ? `Send a new code in ${resendIn}s` : "Send a new code"}
          </Button>
        {/if}
      </form>
    </Card.Content>

    <Card.Footer class="justify-center">
      <p class="text-sm text-muted-foreground">
        {cardCopy[mode].footerPrompt}
        <a
          class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={mode === "sign-in" ? signUpHref : signInHref}
        >
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </a>
      </p>
    </Card.Footer>
  </Card.Root>
</section>
