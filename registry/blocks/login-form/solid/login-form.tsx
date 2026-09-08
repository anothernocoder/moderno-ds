import { For, Show } from "solid-js";
import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/solid";

/**
 * LoginForm — the credential card, composed from @moderno-ui/solid primitives
 * (Card, Field, Checkbox, Button, Alert). Copy it into your project with
 * `moderno add login-form-solid` and edit it freely: every visual comes from
 * the token contract, so a theme re-skins it without a diff here.
 *
 * Four modes, one card: `mode="sign-in"` (the default) is the returning person
 * — email, password, remember-me, the recovery link — `mode="sign-up"` is the
 * new one (full name, email, a new password and the consent that has to be
 * given before an account can exist), `mode="forgot-password"` is the one who
 * cannot get in (the address alone, and — once `sent` — the same card
 * confirming the link is on its way), and `mode="reset-password"` is the end of
 * that errand: the new password and its confirmation, the rules said out loud
 * as they are met, and the token from the emailed link riding along in a hidden
 * input. One block rather than four, because they are one thing: the same card,
 * the same width, the same rhythm.
 *
 * The recovery card confirms in place: `sent` rewrites the header, drops the
 * email field for the sentence explaining what was sent, and turns the submit
 * into a secondary "Send it again" that resubmits the same address from a
 * hidden input — so the resend still works with no JavaScript on the page.
 *
 * The reset card says the rules as they are met: `requirements` is a list of
 * `{ id, label, met }` rendered as the new-password field's own helper text, so
 * Ark points the input's `aria-describedby` at it and a screen reader reads the
 * rules on focus. The list is a polite live region — the one line that flips is
 * announced, not the whole list — and every line carries the word "met" for a
 * reader who cannot see the tick. Whether a rule is met is not decided here:
 * the block holds no value, so the page above it recomputes the flags as the
 * reader types, and with no JavaScript the rules are still printed and the form
 * still submits.
 *
 * Presentational: the block owns no credentials, no request and no navigation.
 * Responsive to its container, not the viewport (ADR-0005) — the root declares
 * `@container`, the secondary row stacks below `@sm` (--container-sm) and sits
 * on one line above it, the heading steps up at `@md` (--container-md), and the
 * card never exceeds --container-sm because a credential field wider than that
 * is harder to read, not easier.
 *
 * States: default and empty are the same pristine render (a credential form has
 * no collection to be empty of); hover and focus-visible come from the
 * primitives' own rules; disabled stops the form; loading makes it inert and
 * marks the button aria-busy. Error is where the modes disagree — signing in,
 * `error` raises one form-level Alert and invalidates both credential fields,
 * never "the password is wrong", which would confirm to an attacker that the
 * email exists; signing up, nothing can be leaked yet and `errors` names the
 * field it rejected, keyed by that field's `name`. Recovering, `errors.email`
 * marks a malformed address, but whether that address *has* an account is never
 * told: the confirmation says "if that address has an account" precisely so the
 * card is not an account-enumeration endpoint with a friendly face. Resetting,
 * both fields may be named — `errors.password` and `errors.confirmPassword` —
 * because the reader is holding the emailed token and there is nothing left to
 * leak; an expired or already-used link is `error`, since what went wrong there
 * is the token, not the password.
 *
 * Class strings are written out in full rather than shared through a variable:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type LoginFormMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

/**
 * One rule the new password is judged against, and whether it is met yet.
 * `met` is computed by whatever owns the value — never in here.
 */
export interface PasswordRequirement {
  /** Stable key for the row. */
  id: string;
  /** The rule in words the reader can act on ("At least 12 characters"). */
  label: string;
  /** Whether what is currently in the field satisfies it. */
  met?: boolean;
}

/**
 * What the card says it is, what its submit says, and what its footer offers,
 * per mode. Four modes turn every one of those into a four-way ternary if they
 * are written at the point of use; the table is the same decision made once.
 * The `forgot-password` card rewrites its title, its description and its submit
 * once the link is sent, and that confirmation is the only copy in the file not
 * read straight off here.
 */
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
};

/**
 * The rules shown under the new password when nothing else is handed down.
 * None of them is ticked, and none of them can be: the card holds no value, so
 * `met` is only ever true because the page above it said so.
 */
const defaultRequirements: PasswordRequirement[] = [
  { id: "length", label: "At least 12 characters" },
  { id: "case", label: "An upper and a lower case letter" },
  { id: "symbol", label: "A number or a symbol" },
];

export interface LoginFormProps {
  /** Which card this is: the returning person, the new one, or the locked-out one. */
  mode?: LoginFormMode;
  /**
   * The rank `Card.Title` carries in the page's heading outline. `3` is the
   * card's own default and leaves the element exactly as it was — a card is a
   * section of a page, not its heading. A *screen* that mounts this card as the
   * whole route passes `1`, so the document has a top-level heading and the
   * headings after it do not skip a rank.
   */
  titleLevel?: 1 | 2 | 3;
  /** `forgot-password` only — the link has gone out: the card confirms instead of asking. */
  sent?: boolean;
  /** `forgot-password` only — the address the link went to: named in the confirmation, and resubmitted by "Send it again". */
  sentTo?: string;
  /** `reset-password` only — the token out of the emailed link, submitted with the new password from a hidden input. */
  token?: string;
  /** `reset-password` only — the rules under the new password and whether each is met yet. `[]` falls back to one line of helper text. */
  requirements?: PasswordRequirement[];
  /** Form-level failure message. Renders the alert; in `sign-in` it also invalidates both credential fields. */
  error?: string;
  /** Every mode but `sign-in` — per-field messages keyed by the field's `name`; each marks that field invalid. */
  errors?: Record<string, string>;
  /** The submit is in flight: every control is inert and the button reads busy. */
  loading?: boolean;
  /** The form is unavailable (SSO-only workspace, locked account, closed beta). */
  disabled?: boolean;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: SubmitEvent) => void;
  /** `sign-in` only — where "Forgot your password?" points. */
  forgotHref?: string;
  /** `sign-in` only — where "Create an account" points. */
  signUpHref?: string;
  /** Every mode but `sign-in` — where "Sign in" points. */
  signInHref?: string;
  /** `sign-up` only — where the terms link under the consent box points. */
  termsHref?: string;
  /** `sign-up` only — where the privacy link under the consent box points. */
  privacyHref?: string;
}

export function LoginForm(props: LoginFormProps) {
  const mode = () => props.mode ?? "sign-in";
  const titleLevel = () => props.titleLevel ?? 3;
  const signUp = () => mode() === "sign-up";
  const forgot = () => mode() === "forgot-password";
  const reset = () => mode() === "reset-password";
  /** The confirmation: the recovery card after the link has gone out. */
  const confirming = () => forgot() && Boolean(props.sent);
  /** Only the modes that start from an address ask for one. */
  const asksForEmail = () => !confirming() && !reset();
  /** A password is being *chosen*, so the field takes the rules and its own error. */
  const newPassword = () => signUp() || reset();
  const requirements = () => props.requirements ?? defaultRequirements;
  const inert = () => Boolean(props.loading) || Boolean(props.disabled);
  /**
   * Signing in, one failure invalidates both credential fields and names
   * neither. In the other two modes only the field that was actually rejected
   * is marked, because there is nothing to leak by saying which one it was.
   */
  const invalid = (field: string) =>
    mode() === "sign-in" ? Boolean(props.error) : Boolean(props.errors?.[field]);
  const title = () => (confirming() ? "Check your inbox" : cardCopy[mode()].title);
  const description = () =>
    confirming()
      ? `If ${props.sentTo || "that address"} has an account, a link to set a new password is on its way.`
      : cardCopy[mode()].description;
  const submitLabel = () => (confirming() ? "Send it again" : cardCopy[mode()].submit);
  const busyLabel = () => cardCopy[mode()].busy;

  return (
    <section class="@container moderno-block-login text-foreground">
      <Card.Root class="mx-auto w-full max-w-sm">
        {/*
          Recovering, the header is a live region from the moment the card
          mounts — `sent` rewrites the title and the description in place, and a
          card whose whole content changed with no announcement leaves a screen
          reader user with one clue that anything happened: the button they just
          pressed renamed itself. The region has to exist *before* the change,
          which is why it hangs off `forgot` and not off `confirming`.
        */}
        <Card.Header role={forgot() ? "status" : undefined}>
          <Card.Title
            class="text-lg @md:text-xl"
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
              {/*
                The token from the emailed link rides in the form rather than in
                a closure, for the same reason the resend's address does: a
                reset that only posts once the island has hydrated strands the
                person it was written for, who is by definition already locked
                out.
              */}
              <input type="hidden" name="token" value={props.token ?? ""} />
            </Show>

            <Show when={confirming()}>
              {/*
                The address travels with the resend in a hidden input rather
                than in a closure: "Send it again" is then a plain form
                submission, which still works on a page whose JavaScript never
                arrived — the same reason the recovery link itself is an `href`.
              */}
              <input type="hidden" name="email" value={props.sentTo ?? ""} />
              <p class="text-sm text-muted-foreground">
                The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
                spam, then send it again.
              </p>
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

            <Show when={!forgot()}>
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
                  {/*
                    The rules are the field's *helper text*, not a list beside
                    it: Ark gives helper text an id and points the input's
                    `aria-describedby` at it, so the rules are read on focus
                    rather than found afterwards. Ark renders that part as a
                    `<span>`, so the rows are spans carrying list roles — a
                    `<ul>` inside phrasing content would be invalid markup. The
                    region is polite and not atomic, so a rule turning green
                    announces its own line and not the other two, and the tick
                    is doubled by a word: colour is never the only carrier.
                  */}
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
              {/*
                The confirmation is a second field rather than a "show password"
                toggle because the two answer different questions: a toggle asks
                whether you can read what you typed, this asks whether you typed
                what you meant twice. Both are `new-password`, so a manager
                offers to fill and then to save the same generated value.
              */}
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
                /* Recovery and reset carry no secondary row: nothing to remember, nowhere else to go. */
                <Show when={!forgot() && !reset()}>
                  <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                    <Checkbox.Root name="remember" size="sm" disabled={inert()}>
                      <Checkbox.Control>
                        <Checkbox.Indicator>✓</Checkbox.Indicator>
                      </Checkbox.Control>
                      <Checkbox.Label>Remember me</Checkbox.Label>
                      <Checkbox.HiddenInput />
                    </Checkbox.Root>

                    <a
                      class="rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={props.forgotHref ?? "#"}
                    >
                      Forgot your password?
                    </a>
                  </div>
                </Show>
              }
            >
              {/*
                Consent is one checkbox with a short label, and the two legal
                links sit under it rather than inside it: Ark's checkbox root is
                a <label>, so an anchor in the label text is a link inside a
                control — a click either follows it or ticks the box depending
                on the browser, and neither answer is the one the reader meant.
              */}
              <div class="grid gap-2">
                <Checkbox.Root name="terms" size="sm" required disabled={inert()}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>
                <p class="text-sm text-muted-foreground">
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
          </form>
        </Card.Content>

        {/*
          One footer, and the way out of the card is the same shape in all four
          modes: a question and the link that answers it. Only `sign-in` sends
          the reader onward to an account they do not have yet; the other three
          send them back to the one they do.
        */}
        <Card.Footer class="justify-center">
          <p class="text-sm text-muted-foreground">
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
