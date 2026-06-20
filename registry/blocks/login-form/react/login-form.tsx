import { Button, Field } from "@moderno/react";

/**
 * LoginForm — an ejected block that composes @moderno/react primitives
 * (Field, Button) into a sign-in card. Copy it into your project and edit
 * freely. All visuals are themed via CSS variables from the design system,
 * so this block holds no hardcoded colors, radii, or fonts.
 */
export function LoginForm() {
  return (
    <form className="moderno-block-login">
      <h2>Sign in</h2>

      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Input type="email" placeholder="you@example.com" />
        <Field.HelperText>We never share it.</Field.HelperText>
      </Field.Root>

      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Field.Input type="password" placeholder="••••••••" />
        <Field.ErrorText>Password is required.</Field.ErrorText>
      </Field.Root>

      <Button type="submit">Sign in</Button>

      <p>
        Don&apos;t have an account? <a href="#">Create one</a>.
      </p>
    </form>
  );
}
