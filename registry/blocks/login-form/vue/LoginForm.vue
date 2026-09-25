<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Card, Checkbox, Field, PinInput } from "@moderno-ui/vue";

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

const props = withDefaults(
  defineProps<{
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
    forgotHref?: string;
    signUpHref?: string;
    signInHref?: string;
    termsHref?: string;
    privacyHref?: string;
  }>(),
  {
    mode: "sign-in",
    titleLevel: 3,
    sent: false,
    sentTo: "",
    codeLength: 6,
    resendIn: 0,
    resent: false,
    token: "",
    requirements: undefined,
    error: undefined,
    errors: undefined,
    loading: false,
    disabled: false,
    forgotHref: "#",
    signUpHref: "#",
    signInHref: "#",
    termsHref: "#",
    privacyHref: "#",
  },
);

const emit = defineEmits<{ submit: [event: Event] }>();

const signUp = computed(() => props.mode === "sign-up");
const forgot = computed(() => props.mode === "forgot-password");
const reset = computed(() => props.mode === "reset-password");
const verify = computed(() => props.mode === "verify");
const confirming = computed(() => forgot.value && props.sent);
const asksForEmail = computed(() => !confirming.value && !reset.value && !verify.value);
const cells = computed(() =>
  Array.from({ length: Math.max(1, Math.trunc(props.codeLength)) }, (_, index) => index),
);
const waiting = computed(() => verify.value && props.resendIn > 0);
const newPassword = computed(() => signUp.value || reset.value);
const inert = computed(() => props.loading || props.disabled);
// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const passwordRules = computed(() => props.requirements ?? defaultRequirements);
const invalid = (field: string) =>
  props.mode === "sign-in" ? Boolean(props.error) : Boolean(props.errors?.[field]);
const title = computed(() => (confirming.value ? "Check your inbox" : cardCopy[props.mode].title));
const verifyDescription = computed(() =>
  props.resent
    ? `A new code is on its way to ${props.sentTo || "your inbox"}. The one before it has stopped working.`
    : props.sentTo
      ? `Enter the ${cells.value.length}-digit code we sent to ${props.sentTo}.`
      : cardCopy.verify.description,
);
const description = computed(() =>
  confirming.value
    ? `If ${props.sentTo || "that address"} has an account, a link to set a new password is on its way.`
    : verify.value
      ? verifyDescription.value
      : cardCopy[props.mode].description,
);
const submitLabel = computed(() =>
  confirming.value ? "Send it again" : cardCopy[props.mode].submit,
);
const busyLabel = computed(() => cardCopy[props.mode].busy);
const footerPrompt = computed(() => cardCopy[props.mode].footerPrompt);
</script>

<template>
  <section class="@container moderno-block-login text-foreground">
    <Card.Root class="mx-auto w-full max-w-sm">
      <Card.Header :role="forgot || verify ? 'status' : undefined">
        <Card.Title
          class="text-body-lg @md:text-heading-sm"
          :aria-level="titleLevel === 3 ? undefined : titleLevel"
          >{{ title }}</Card.Title
        >
        <Card.Description>{{ description }}</Card.Description>
      </Card.Header>

      <Card.Content>
        <form class="grid gap-5" novalidate @submit="emit('submit', $event)">
          <Alert.Root v-if="error" variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
            </Alert.Content>
          </Alert.Root>

          <input v-if="reset && token" type="hidden" name="token" :value="token" />

          <input v-if="confirming" type="hidden" name="email" :value="sentTo" />
          <p v-if="confirming" class="text-ui-md text-muted-foreground">
            The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
            spam, then send it again.
          </p>

          <input v-if="verify && sentTo" type="hidden" name="email" :value="sentTo" />

          <div v-if="verify" class="grid gap-2">
            <PinInput.Root
              name="code"
              :count="cells.length"
              otp
              required
              :disabled="inert"
              :invalid="invalid('code')"
            >
              <PinInput.Label>Verification code</PinInput.Label>
              <PinInput.Control>
                <PinInput.Input v-for="index in cells" :key="index" :index="index" />
              </PinInput.Control>
              <PinInput.HiddenInput />
            </PinInput.Root>
            <p v-if="errors?.code" class="text-ui-md text-destructive" role="alert">
              {{ errors.code }}
            </p>
          </div>

          <Field.Root v-if="signUp" required :invalid="invalid('fullName')" :disabled="inert">
            <Field.Label>Full name</Field.Label>
            <Field.Input name="fullName" autocomplete="name" placeholder="Ada Lovelace" />
            <Field.ErrorText>{{ errors?.fullName }}</Field.ErrorText>
          </Field.Root>

          <Field.Root v-if="asksForEmail" required :invalid="invalid('email')" :disabled="inert">
            <Field.Label>Email</Field.Label>
            <Field.Input
              name="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
            />
            <Field.ErrorText v-if="signUp || forgot">{{ errors?.email }}</Field.ErrorText>
          </Field.Root>

          <Field.Root
            v-if="!forgot && !verify"
            required
            :invalid="invalid('password')"
            :disabled="inert"
          >
            <Field.Label>{{ reset ? "New password" : "Password" }}</Field.Label>
            <Field.Input
              name="password"
              type="password"
              :autocomplete="newPassword ? 'new-password' : 'current-password'"
              placeholder="••••••••"
            />
            <Field.HelperText
              v-if="reset && passwordRules.length > 0"
              class="grid gap-1"
              role="list"
              aria-live="polite"
            >
              <span
                v-for="requirement in passwordRules"
                :key="requirement.id"
                role="listitem"
                class="flex items-center gap-2"
              >
                <span aria-hidden="true">{{ requirement.met ? "✓" : "○" }}</span>
                <span :class="requirement.met ? 'text-foreground' : undefined">{{
                  requirement.label
                }}</span>
                <span class="sr-only">{{ requirement.met ? "— met" : "— not met yet" }}</span>
              </span>
            </Field.HelperText>
            <Field.HelperText v-else-if="newPassword">
              At least 12 characters. A passphrase beats a puzzle.
            </Field.HelperText>
            <Field.ErrorText v-if="newPassword">{{ errors?.password }}</Field.ErrorText>
          </Field.Root>

          <Field.Root v-if="reset" required :invalid="invalid('confirmPassword')" :disabled="inert">
            <Field.Label>Confirm new password</Field.Label>
            <Field.Input
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
            />
            <Field.ErrorText>{{ errors?.confirmPassword }}</Field.ErrorText>
          </Field.Root>

          <div v-if="signUp" class="grid gap-2">
            <Checkbox.Root name="terms" size="sm" required :disabled="inert">
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
            <p class="text-ui-md text-muted-foreground">
              Read the
              <a
                class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                :href="termsHref"
              >
                terms of service
              </a>
              and the
              <a
                class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                :href="privacyHref"
              >
                privacy policy </a
              >.
            </p>
          </div>

          <div
            v-else-if="!forgot && !reset && !verify"
            class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between"
          >
            <Checkbox.Root name="remember" size="sm" :disabled="inert">
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Remember me</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>

            <a
              class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              :href="forgotHref"
            >
              Forgot your password?
            </a>
          </div>

          <Button
            type="submit"
            :variant="confirming ? 'secondary' : 'primary'"
            class="w-full"
            :disabled="inert"
            :aria-busy="loading"
          >
            <template v-if="loading">
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              {{ busyLabel }}
            </template>
            <template v-else>{{ submitLabel }}</template>
          </Button>

          <Button
            v-if="verify"
            type="submit"
            name="intent"
            value="resend"
            variant="ghost"
            class="w-full"
            :disabled="inert || waiting"
          >
            {{ waiting ? `Send a new code in ${resendIn}s` : "Send a new code" }}
          </Button>
        </form>
      </Card.Content>

      <Card.Footer class="justify-center">
        <p class="text-ui-md text-muted-foreground">
          {{ footerPrompt }}
          <a
            class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="mode === 'sign-in' ? signUpHref : signInHref"
          >
            {{ mode === "sign-in" ? "Create an account" : "Sign in" }}
          </a>
        </p>
      </Card.Footer>
    </Card.Root>
  </section>
</template>
