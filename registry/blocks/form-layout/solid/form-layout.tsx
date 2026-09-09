import { Show } from "solid-js";
import { Alert, Button, Checkbox, Divider, Field } from "@moderno-ui/solid";

/**
 * FormLayout — the grouped settings form: a titled section per group of related
 * fields, a field grid that goes one-up → two-up, and one actions row for the
 * whole form. Copy it into your project with `moderno add form-layout-solid`
 * and edit it freely: the groups, the fields and the copy are yours from that
 * moment, and every visual comes from the token contract, so a theme re-skins
 * it without a diff here.
 *
 * Presentational: the block holds no values, issues no request and hands the
 * native submit event back.
 *
 * Responsive to its container, not the viewport (ADR-0005) — the root declares
 * `@container` and uses all three contract steps: at `@sm` (--container-sm) the
 * actions row stops stacking and lines up to the trailing edge; at `@md`
 * (--container-md) the field grid goes one-up → two-up; at `@lg`
 * (--container-lg) each group's heading leaves the top of its fields and sits
 * beside them, turning a long scroll into a scannable index of the form.
 *
 * States: default and empty are the same render (a form is the input surface,
 * and there is no collection here to be empty of); hover and focus-visible come
 * from the primitives' own rules; disabled makes the form read-only; loading
 * makes it inert and marks the submit aria-busy; error renders a form-level
 * Alert plus, per key in `errors`, that field's own Field.ErrorText. Unlike a
 * sign-in form, a settings form names the field that failed — the person
 * editing it already owns the account.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export interface FormLayoutProps {
  /** Form-level failure message — what went wrong with the save as a whole. */
  error?: string;
  /** Per-field messages keyed by the field's `name`; each marks that field invalid. */
  errors?: Record<string, string>;
  /** The save is in flight: every control is inert and the submit reads busy. */
  loading?: boolean;
  /** The form is read-only (a viewer-role member, a locked account). */
  disabled?: boolean;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: SubmitEvent) => void;
  /** Discard: the trailing "Cancel" in the actions row. */
  onCancel?: () => void;
}

export function FormLayout(props: FormLayoutProps) {
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);

  return (
    <section class="@container moderno-block-form-layout text-foreground">
      <form class="grid gap-8" onSubmit={props.onSubmit} noValidate>
        <header class="grid gap-1">
          <h2 class="text-lg font-semibold @md:text-xl">Account settings</h2>
          <p class="text-sm text-muted-foreground">
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
            <h3 class="text-sm font-medium">Profile</h3>
            <p class="text-sm text-muted-foreground">
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
            <h3 class="text-sm font-medium">Notifications</h3>
            <p class="text-sm text-muted-foreground">
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
