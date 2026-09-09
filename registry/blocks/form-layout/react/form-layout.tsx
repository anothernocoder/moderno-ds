import type { FormEvent } from "react";
import { Alert, Button, Checkbox, Divider, Field } from "@moderno-ui/react";

/**
 * FormLayout — the grouped settings form: a titled section per group of
 * related fields, a field grid that goes one-up → two-up, and one actions row
 * for the whole form. Copy it into your project with
 * `moderno add form-layout-react` and edit it freely: the groups, the fields
 * and the copy are yours from that moment, and every visual comes from the
 * token contract, so a theme re-skins it without a diff here.
 *
 * **Presentational.** The block holds no values and issues no request: it takes
 * `error` / `errors` / `loading` / `disabled` and hands the native submit event
 * back. Controls are uncontrolled — read the form in your submit handler (or
 * swap in your form library's bindings, since the file is yours).
 *
 * **Responsive to its container, not the viewport** (ADR-0005). The root
 * declares `@container` and the block uses all three contract steps, each for a
 * different decision:
 *
 * - `@sm` (`--container-sm`, 24rem) — the actions row stops stacking and lines
 *   up to the trailing edge, where a form's confirmation belongs once there is
 *   room for it.
 * - `@md` (`--container-md`, 36rem) — the field grid goes one-up → two-up, so
 *   short fields pair off instead of running a column of half-empty rows.
 * - `@lg` (`--container-lg`, 48rem) — each group's heading leaves the top of
 *   its fields and sits beside them, which is what turns a long scroll into a
 *   scannable index of the form.
 *
 * The same file is therefore right in a 320px settings sidebar, in a dialog and
 * on a full-width page, with no media query anywhere.
 *
 * **States.** *Default* and *empty* are the same render: a form is the input
 * surface, so "nothing entered yet" is its resting state — placeholders and
 * helper text carry the format, and there is no collection here to be empty of.
 * *Hover* and *focus-visible* come from the primitives' own rules in
 * `components.css`. *Disabled* makes the whole form read-only (a viewer-role
 * member, a locked account), *loading* makes it inert and marks the submit
 * `aria-busy`, and *error* renders a form-level `Alert` plus, for every key in
 * `errors`, that field's own `Field.ErrorText`.
 *
 * Unlike a sign-in form — which must never say *which* credential was wrong —
 * a settings form should name the field: the person editing it already owns the
 * account, and "Enter a valid email address" next to the box is the only
 * message they can act on.
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
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Discard: the trailing "Cancel" in the actions row. */
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
          <h2 className="text-lg font-semibold @md:text-xl">Account settings</h2>
          <p className="text-sm text-muted-foreground">
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
            <h3 className="text-sm font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground">
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
            <h3 className="text-sm font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">
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
