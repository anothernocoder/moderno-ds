import { Show } from "solid-js";
import { Alert, Button, Checkbox, Divider, Field } from "@moderno-ui/solid";

export interface FormLayoutProps {
  error?: string;
  errors?: Record<string, string>;
  loading?: boolean;
  disabled?: boolean;
  onSubmit?: (event: SubmitEvent) => void;
  onCancel?: () => void;
}

export function FormLayout(props: FormLayoutProps) {
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);

  return (
    <section class="@container moderno-block-form-layout text-foreground">
      <form class="grid gap-8" onSubmit={props.onSubmit} noValidate>
        <header class="grid gap-1">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">Account settings</h2>
          <p class="text-ui-md text-muted-foreground">
            Update how you appear to your workspace and choose what we email you about.
          </p>
        </header>

        <Show when={props.error}>
          {(message) => (
            <Alert.Root variant="error" size="sm">
              <Alert.Content>
                <Alert.Title>{message()}</Alert.Title>
              </Alert.Content>
            </Alert.Root>
          )}
        </Show>

        <div class="grid gap-6 @lg:grid-cols-3">
          <header class="grid gap-1">
            <h3 class="text-ui-md font-medium">Profile</h3>
            <p class="text-ui-md text-muted-foreground">
              How you appear to the rest of your workspace.
            </p>
          </header>

          <div class="grid gap-5 @md:grid-cols-2 @lg:col-span-2">
            <Field.Root required invalid={Boolean(props.errors?.fullName)} disabled={inert()}>
              <Field.Label>Full name</Field.Label>
              <Field.Input name="fullName" autocomplete="name" placeholder="Ada Lovelace" />
              <Field.ErrorText>{props.errors?.fullName}</Field.ErrorText>
            </Field.Root>

            <Field.Root required invalid={Boolean(props.errors?.email)} disabled={inert()}>
              <Field.Label>Email</Field.Label>
              <Field.Input
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
              />
              <Field.ErrorText>{props.errors?.email}</Field.ErrorText>
            </Field.Root>

            <Field.Root
              class="@md:col-span-2"
              invalid={Boolean(props.errors?.about)}
              disabled={inert()}
            >
              <Field.Label>About</Field.Label>
              <Field.Textarea name="about" placeholder="A sentence your teammates will read." />
              <Field.HelperText>
                Shown on your profile. Plain text, 280 characters.
              </Field.HelperText>
              <Field.ErrorText>{props.errors?.about}</Field.ErrorText>
            </Field.Root>
          </div>
        </div>

        <Divider />

        <div class="grid gap-6 @lg:grid-cols-3">
          <header class="grid gap-1">
            <h3 class="text-ui-md font-medium">Notifications</h3>
            <p class="text-ui-md text-muted-foreground">
              We only email you about the things you keep switched on here.
            </p>
          </header>

          <div class="grid gap-4 @lg:col-span-2">
            <Checkbox.Root name="productUpdates" size="sm" disabled={inert()}>
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Product updates — what shipped, roughly monthly</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>

            <Checkbox.Root name="securityAlerts" size="sm" disabled={inert()}>
              <Checkbox.Control>
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label>Security alerts — new sign-ins and password changes</Checkbox.Label>
              <Checkbox.HiddenInput />
            </Checkbox.Root>
          </div>
        </div>

        <Divider />

        <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-end">
          <Button type="button" variant="secondary" disabled={inert()} onClick={props.onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={inert()} aria-busy={props.loading}>
            <Show when={props.loading} fallback="Save changes">
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              Saving
            </Show>
          </Button>
        </div>
      </form>
    </section>
  );
}
