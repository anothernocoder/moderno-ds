<script setup lang="ts">
/**
 * LoginForm — the sign-in section, composed from @moderno-ui/vue primitives
 * (Card, Field, Checkbox, Button, Alert). Copy it into your project with
 * `moderno add login-form-vue` and edit it freely: every visual comes from the
 * token contract, so a theme re-skins it without a diff here.
 *
 * Presentational: the block owns no credentials, no request and no navigation.
 * Responsive to its container, not the viewport (ADR-0005) — the root declares
 * `@container`, the secondary row stacks below `@sm` (--container-sm) and sits
 * on one line above it, the heading steps up at `@md` (--container-md), and the
 * card never exceeds --container-sm because a credential field wider than that
 * is harder to read, not easier.
 *
 * States: default and empty are the same pristine render (a sign-in form has no
 * collection to be empty of); hover and focus-visible come from the primitives'
 * own rules; disabled stops the form; loading makes it inert and marks the
 * button aria-busy; error raises one form-level Alert and invalidates both
 * credential fields — never "the password is wrong", which would confirm to an
 * attacker that the email exists.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
import { computed } from "vue";
import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/vue";

const props = withDefaults(
  defineProps<{
    /** Form-level failure message. Renders the alert and invalidates both credential fields. */
    error?: string;
    /** The submit is in flight: every control is inert and the button reads busy. */
    loading?: boolean;
    /** Sign-in is unavailable (SSO-only workspace, locked account). */
    disabled?: boolean;
    /** Where "Forgot your password?" points. */
    forgotHref?: string;
    /** Where "Create an account" points. */
    signUpHref?: string;
  }>(),
  { error: undefined, loading: false, disabled: false, forgotHref: "#", signUpHref: "#" },
);

/** Native submit; call `event.preventDefault()` and read the form yourself. */
const emit = defineEmits<{ submit: [event: Event] }>();

const inert = computed(() => props.loading || props.disabled);
const invalid = computed(() => Boolean(props.error));
</script>

<template>
  <section class="@container moderno-block-login text-foreground">
    <Card.Root class="mx-auto w-full max-w-sm">
      <Card.Header>
        <Card.Title class="text-lg @md:text-xl">Sign in</Card.Title>
        <Card.Description>Enter your email and password to continue.</Card.Description>
      </Card.Header>

      <Card.Content>
        <form class="grid gap-5" novalidate @submit="emit('submit', $event)">
          <Alert.Root v-if="error" variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{{ error }}</Alert.Title>
            </Alert.Content>
          </Alert.Root>

          <Field.Root required :invalid="invalid" :disabled="inert">
            <Field.Label>Email</Field.Label>
            <Field.Input
              name="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
            />
          </Field.Root>

          <Field.Root required :invalid="invalid" :disabled="inert">
            <Field.Label>Password</Field.Label>
            <Field.Input
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </Field.Root>

          <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
            <Checkbox.Root name="remember" size="sm" :disabled="inert">
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Remember me</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>

            <a
              class="rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              :href="forgotHref"
            >
              Forgot your password?
            </a>
          </div>

          <Button type="submit" class="w-full" :disabled="inert" :aria-busy="loading">
            <template v-if="loading">
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              Signing in
            </template>
            <template v-else>Sign in</template>
          </Button>
        </form>
      </Card.Content>

      <Card.Footer class="justify-center">
        <p class="text-sm text-muted-foreground">
          New here?
          <a
            class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="signUpHref"
          >
            Create an account
          </a>
        </p>
      </Card.Footer>
    </Card.Root>
  </section>
</template>
