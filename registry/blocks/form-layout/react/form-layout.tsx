import type { FormEvent } from "react";
import { Alert, Button, Checkbox, Divider, Field } from "@moderno-ui/react";

export interface FormLayoutProps {
  error?: string;
  errors?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

export function FormLayout({
  error,
  errors,
  loading = false,
  disabled = false,
  onSubmit,
  onCancel,
}: FormLayoutProps) {
  const inert = loading || disabled;

  return (
    <section className="@container moderno-block-form-layout text-foreground">
      <form className="grid gap-8" onSubmit={onSubmit} noValidate>
        <header className="grid gap-1">
          <h2 className="text-body-lg font-semibold @md:text-heading-sm">Account settings</h2>
          <p className="text-ui-md text-muted-foreground">
            Update how you appear to your workspace and choose what we email you about.
          </p>
        </header>

        {error ? (
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        <div className="grid gap-6 @lg:grid-cols-3">
          <header className="grid gap-1">
            <h3 className="text-ui-md font-medium">Profile</h3>
            <p className="text-ui-md text-muted-foreground">
              How you appear to the rest of your workspace.
            </p>
          </header>

          <div className="grid gap-5 @md:grid-cols-2 @lg:col-span-2">
            <Field.Root required invalid={Boolean(errors?.fullName)} disabled={inert}>
              <Field.Label>Full name</Field.Label>
              <Field.Input name="fullName" autoComplete="name" placeholder="Ada Lovelace" />
              <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
            </Field.Root>

            <Field.Root required invalid={Boolean(errors?.email)} disabled={inert}>
              <Field.Label>Email</Field.Label>
              <Field.Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
              <Field.ErrorText>{errors?.email}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              className="@md:col-span-2"
              invalid={Boolean(errors?.about)}
              disabled={inert}
            >
              <Field.Label>About</Field.Label>
              <Field.Textarea name="about" placeholder="A sentence your teammates will read." />
              <Field.HelperText>
                Shown on your profile. Plain text, 280 characters.
              </Field.HelperText>
              <Field.ErrorText>{errors?.about}</Field.ErrorText>
            </Field.Root>
          </div>
        </div>

        <Divider />

        <div className="grid gap-6 @lg:grid-cols-3">
          <header className="grid gap-1">
            <h3 className="text-ui-md font-medium">Notifications</h3>
            <p className="text-ui-md text-muted-foreground">
              We only email you about the things you keep switched on here.
            </p>
          </header>

          <div className="grid gap-4 @lg:col-span-2">
            <Checkbox.Root name="productUpdates" size="sm" disabled={inert}>
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Product updates — what shipped, roughly monthly</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>

            <Checkbox.Root name="securityAlerts" size="sm" disabled={inert}>
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Security alerts — new sign-ins and password changes</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
          </div>
        </div>

        <Divider />

        <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-end">
          <Button type="button" variant="secondary" disabled={inert} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={inert} aria-busy={loading}>
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
