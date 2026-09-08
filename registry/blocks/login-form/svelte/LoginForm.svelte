<!--
  LoginForm — the sign-in section, composed from @moderno-ui/svelte primitives
  (Card, Field, Checkbox, Button, Alert). Copy it into your project with
  `moderno add login-form-svelte` and edit it freely: every visual comes from
  the token contract, so a theme re-skins it without a diff here.

  Presentational. The block owns no credentials, no request and no navigation:
  it takes `error` / `loading` / `disabled` and hands the native submit event
  back, so the `sign-in` screen above it holds the state while this file stays a
  section you can drop anywhere.

  Responsive to its container, not the viewport (ADR-0005). The root declares
  `@container`; the secondary row (remember-me + the recovery link) stacks below
  `@sm` (--container-sm, 24rem) and sits on one line at or above it, and the
  heading steps up at `@md` (--container-md, 36rem) where the section has room
  to breathe. The card itself never exceeds --container-sm, because a credential
  field wider than that is harder to read, not easier — so the same file is
  correct in a narrow sidebar, inside a card, and centred on a full-width page,
  with no media query anywhere.

  States. Default and empty are the same pristine render (placeholders, no
  values) — a sign-in form has no collection to be empty of. Hover and
  focus-visible come from the primitives' own rules in components.css; the links
  here carry the matching pair. Disabled stops the form (an SSO-only workspace,
  a locked account), loading makes it inert and marks the button aria-busy, and
  error raises one form-level Alert and marks both credential fields invalid —
  never "the password is wrong", which would confirm to an attacker that the
  email exists.

  Class strings are written out in full rather than shared through a variable:
  the docs compile the previews' Tailwind from `class` attributes, so a class
  assembled in JS would render here and vanish in the preview.
-->
<script lang="ts">
  import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/svelte";

  interface Props {
    /** Form-level failure message. Renders the alert and invalidates both credential fields. */
    error?: string;
    /** The submit is in flight: every control is inert and the button reads busy. */
    loading?: boolean;
    /** Sign-in is unavailable (SSO-only workspace, locked account). */
    disabled?: boolean;
    /** Native submit; call `event.preventDefault()` and read the form yourself. */
    onsubmit?: (event: SubmitEvent) => void;
    /** Where "Forgot your password?" points. */
    forgotHref?: string;
    /** Where "Create an account" points. */
    signUpHref?: string;
  }

  let {
    error,
    loading = false,
    disabled = false,
    onsubmit,
    forgotHref = "#",
    signUpHref = "#",
  }: Props = $props();

  const inert = $derived(loading || disabled);
  const invalid = $derived(Boolean(error));
</script>

<section class="@container moderno-block-login text-foreground">
  <Card.Root class="mx-auto w-full max-w-sm">
    <Card.Header>
      <Card.Title class="text-lg @md:text-xl">Sign in</Card.Title>
      <Card.Description>Enter your email and password to continue.</Card.Description>
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

        <Field.Root required {invalid} disabled={inert}>
          <Field.Label>Email</Field.Label>
          <Field.Input name="email" type="email" autocomplete="email" placeholder="you@example.com" />
        </Field.Root>

        <Field.Root required {invalid} disabled={inert}>
          <Field.Label>Password</Field.Label>
          <Field.Input
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </Field.Root>

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

        <Button type="submit" class="w-full" disabled={inert} aria-busy={loading}>
          {#if loading}
            <span
              aria-hidden="true"
              class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            ></span>
            Signing in
          {:else}
            Sign in
          {/if}
        </Button>
      </form>
    </Card.Content>

    <Card.Footer class="justify-center">
      <p class="text-sm text-muted-foreground">
        New here?
        <a
          class="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={signUpHref}
        >
          Create an account
        </a>
      </p>
    </Card.Footer>
  </Card.Root>
</section>
