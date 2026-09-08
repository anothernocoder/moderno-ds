import type { FormEvent } from "react";
import { Alert, Button, Card, Checkbox, Field } from "@moderno-ui/react";

/**
 * LoginForm — the credential card, composed from @moderno-ui/react primitives
 * (Card, Field, Checkbox, Button, Alert). Copy it into your project with
 * `moderno add login-form-react` and edit it freely: every visual comes from
 * the token contract, so a theme re-skins it without a diff here.
 *
 * **Four modes, one card.** `mode="sign-in"` (the default) is the returning
 * person: email, password, remember-me, the recovery link. `mode="sign-up"` is
 * the new one: full name, email, a new password and the consent that has to be
 * given before an account can exist. `mode="forgot-password"` is the one who
 * cannot get in: the address alone, and — once `sent` — the same card
 * confirming the link is on its way. `mode="reset-password"` is the end of that
 * errand: the new password and its confirmation, the rules said out loud as they
 * are met, and the token from the emailed link riding along in a hidden input.
 * They are one block rather than four because they are one thing — the same
 * card, the same width, the same rhythm — and a person walking the auth flow
 * should not feel the page change under them. The `sign-in`, `sign-up`,
 * `forgot-password` and `reset-password` screens each mount this file in one of
 * its modes.
 *
 * **The recovery card confirms in place.** `sent` does not swap the card for a
 * different component: the header rewrites itself, the email field gives way to
 * the sentence explaining what was sent, and the submit becomes a secondary
 * "Send it again" that resubmits the same address — carried in a hidden input,
 * so the resend still works with no JavaScript on the page. Nothing moves, and
 * the reader's eye does not have to find the page again.
 *
 * **The reset card says the rules as they are met.** `requirements` is a list of
 * `{ id, label, met }`, rendered under the new-password field as that field's
 * own helper text — so Ark points the input's `aria-describedby` at it and a
 * screen reader reads the rules on focus instead of hunting for them. The list
 * is a polite live region, so the one line that flips is announced rather than
 * the whole list, and every line carries the word "met" for a reader who cannot
 * see the tick. Whether a rule *is* met is not decided here: the block holds no
 * value, so the page above it recomputes the flags as the reader types — and
 * with no JavaScript on the page the rules are still printed and the form still
 * submits, which is why they are helper text rather than a validator.
 *
 * **Presentational.** The block owns no credentials, no request and no
 * navigation: it takes `error` / `errors` / `loading` / `disabled` and hands the
 * native submit event back. That is what lets the screen above it hold the
 * state while this file stays a section you can drop anywhere.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). The root
 * declares `@container`; the secondary row (remember-me + the recovery link)
 * stacks below `@sm` (`--container-sm`, 24rem) and sits on one line at or above
 * it, and the heading steps up at `@md` (`--container-md`, 36rem) where the
 * section has room to breathe. The card itself never exceeds `--container-sm`,
 * because a credential field wider than that is harder to read, not easier — so
 * the same file is correct in a narrow sidebar, inside a card, and centred on a
 * full-width page, with no media query anywhere.
 *
 * **States.** Default and *empty* are the same pristine render (placeholders,
 * no values) — a credential form has no collection to be empty of. *Hover* and
 * *focus-visible* come from the primitives' own rules in `components.css`; the
 * links here carry the matching pair so the whole block answers a pointer and a
 * keyboard alike. *Disabled* stops the form (an SSO-only workspace, a locked
 * account, a closed beta), and *loading* makes it inert and marks the button
 * `aria-busy`.
 *
 * *Error* is the one place the modes deliberately disagree. Signing in, `error`
 * raises one form-level Alert and marks both credential fields invalid — never
 * "the password is wrong", which would confirm to an attacker that the email
 * exists. Signing up, there is nothing to leak yet and a form that will not say
 * *which* field it rejected is merely rude, so `errors` names them: keyed by
 * the field's `name` (`fullName`, `email`, `password`), each key marking that
 * field invalid and printing its own message. `error` stays the form-level
 * failure — the account could not be created at all, the consent box is
 * unticked, the service is down.
 *
 * Recovering, `errors.email` marks a malformed address, which leaks nothing;
 * but whether the address *has* an account is never told, in this card or in
 * the code behind it. The confirmation is deliberately conditional — "if that
 * address has an account" — because a recovery form that answers differently
 * for a known and an unknown address is an account-enumeration endpoint with a
 * friendly face.
 *
 * Resetting, both fields may be named — `errors.password` for a password the
 * rules reject, `errors.confirmPassword` for two that do not match — because
 * the reader is holding the emailed token and there is nothing left to leak.
 * `error` stays the form-level failure, and it is where an expired or
 * already-used link belongs: what went wrong there is the token, not the
 * password, and no field should be marked for it.
 *
 * Class strings are written out in full rather than shared through a constant:
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
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
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

export function LoginForm({
  mode = "sign-in",
  titleLevel = 3,
  sent = false,
  sentTo = "",
  token = "",
  requirements = defaultRequirements,
  error,
  errors,
  loading = false,
  disabled = false,
  onSubmit,
  forgotHref = "#",
  signUpHref = "#",
  signInHref = "#",
  termsHref = "#",
  privacyHref = "#",
}: LoginFormProps) {
  const signUp = mode === "sign-up";
  const forgot = mode === "forgot-password";
  const reset = mode === "reset-password";
  /** The confirmation: the recovery card after the link has gone out. */
  const confirming = forgot && sent;
  /** Only the modes that start from an address ask for one. */
  const asksForEmail = !confirming && !reset;
  /** A password is being *chosen*, so the field takes the rules and its own error. */
  const newPassword = signUp || reset;
  const inert = loading || disabled;
  /**
   * Signing in, one failure invalidates both credential fields and names
   * neither. In the other two modes only the field that was actually rejected
   * is marked, because there is nothing to leak by saying which one it was.
   */
  const invalid = (field: string) =>
    mode === "sign-in" ? Boolean(error) : Boolean(errors?.[field]);
  const title = confirming ? "Check your inbox" : cardCopy[mode].title;
  const description = confirming
    ? `If ${sentTo || "that address"} has an account, a link to set a new password is on its way.`
    : cardCopy[mode].description;
  const submitLabel = confirming ? "Send it again" : cardCopy[mode].submit;
  const busyLabel = cardCopy[mode].busy;

  return (
    <section className="@container moderno-block-login text-foreground">
      <Card.Root className="mx-auto w-full max-w-sm">
        {/*
          Recovering, the header is a live region from the moment the card
          mounts — `sent` rewrites the title and the description in place, and a
          card whose whole content changed with no announcement leaves a screen
          reader user with one clue that anything happened: the button they just
          pressed renamed itself. The region has to exist *before* the change,
          which is why it hangs off `forgot` and not off `confirming`.
        */}
        <Card.Header role={forgot ? "status" : undefined}>
          <Card.Title
            className="text-lg @md:text-xl"
            aria-level={titleLevel === 3 ? undefined : titleLevel}
          >
            {title}
          </Card.Title>
          <Card.Description>{description}</Card.Description>
        </Card.Header>

        <Card.Content>
          <form className="grid gap-5" onSubmit={onSubmit} noValidate>
            {error ? (
              <Alert.Root variant="error" size="sm">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Content>
              </Alert.Root>
            ) : null}

            {confirming ? (
              /*
               * The address travels with the resend in a hidden input rather
               * than in a closure: "Send it again" is then a plain form
               * submission, which still works on a page whose JavaScript never
               * arrived — the same reason the recovery link itself is an
               * `href`.
               */
              <input type="hidden" name="email" value={sentTo} />
            ) : null}

            {reset && token ? (
              /*
               * The token from the emailed link rides in the form rather than in
               * a closure, for the same reason the resend's address does: a
               * reset that only posts once React has hydrated strands the person
               * it was written for, who is by definition already locked out.
               */
              <input type="hidden" name="token" value={token} />
            ) : null}

            {confirming ? (
              <p className="text-sm text-muted-foreground">
                The link expires in 30 minutes and can be used once. Nothing in your inbox? Look in
                spam, then send it again.
              </p>
            ) : null}

            {signUp ? (
              <Field.Root required invalid={invalid("fullName")} disabled={inert}>
                <Field.Label>Full name</Field.Label>
                <Field.Input name="fullName" autoComplete="name" placeholder="Ada Lovelace" />
                <Field.ErrorText>{errors?.fullName}</Field.ErrorText>
              </Field.Root>
            ) : null}

            {asksForEmail ? (
              <Field.Root required invalid={invalid("email")} disabled={inert}>
                <Field.Label>Email</Field.Label>
                <Field.Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {signUp || forgot ? <Field.ErrorText>{errors?.email}</Field.ErrorText> : null}
              </Field.Root>
            ) : null}

            {forgot ? null : (
              <Field.Root required invalid={invalid("password")} disabled={inert}>
                <Field.Label>{reset ? "New password" : "Password"}</Field.Label>
                <Field.Input
                  name="password"
                  type="password"
                  autoComplete={newPassword ? "new-password" : "current-password"}
                  placeholder="••••••••"
                />
                {reset && requirements.length > 0 ? (
                  /*
                   * The rules are the field's *helper text*, not a list beside
                   * it: Ark gives helper text an id and points the input's
                   * `aria-describedby` at it, so the rules are read on focus
                   * rather than found afterwards. Ark renders that part as a
                   * `<span>`, so the rows are spans carrying list roles — a
                   * `<ul>` inside phrasing content would be invalid markup. The
                   * region is polite and not atomic, so a rule turning green
                   * announces its own line and not the other two, and the tick
                   * is doubled by a word: colour is never the only carrier.
                   */
                  <Field.HelperText className="grid gap-1" role="list" aria-live="polite">
                    {requirements.map((requirement) => (
                      <span
                        key={requirement.id}
                        role="listitem"
                        className="flex items-center gap-2"
                      >
                        <span aria-hidden="true">{requirement.met ? "✓" : "○"}</span>
                        <span className={requirement.met ? "text-foreground" : undefined}>
                          {requirement.label}
                        </span>
                        <span className="sr-only">
                          {requirement.met ? "— met" : "— not met yet"}
                        </span>
                      </span>
                    ))}
                  </Field.HelperText>
                ) : newPassword ? (
                  <Field.HelperText>
                    At least 12 characters. A passphrase beats a puzzle.
                  </Field.HelperText>
                ) : null}
                {newPassword ? <Field.ErrorText>{errors?.password}</Field.ErrorText> : null}
              </Field.Root>
            )}

            {reset ? (
              /*
               * The confirmation is a second field rather than a "show password"
               * toggle because the two answer different questions: a toggle asks
               * whether you can read what you typed, this asks whether you typed
               * what you meant twice. Both are `new-password`, so a manager
               * offers to fill and then to save the same generated value.
               */
              <Field.Root required invalid={invalid("confirmPassword")} disabled={inert}>
                <Field.Label>Confirm new password</Field.Label>
                <Field.Input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <Field.ErrorText>{errors?.confirmPassword}</Field.ErrorText>
              </Field.Root>
            ) : null}

            {forgot || reset ? null : signUp ? (
              /*
               * Consent is one checkbox with a short label, and the two legal
               * links sit *under* it rather than inside it: Ark's checkbox root
               * is a `<label>`, so an anchor in the label text is a link inside
               * a control — a click either follows it or ticks the box
               * depending on the browser, and neither answer is the one the
               * reader meant.
               */
              <div className="grid gap-2">
                <Checkbox.Root name="terms" size="sm" required disabled={inert}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>I agree to the terms and the privacy policy</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>
                <p className="text-sm text-muted-foreground">
                  Read the{" "}
                  <a
                    className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={termsHref}
                  >
                    terms of service
                  </a>{" "}
                  and the{" "}
                  <a
                    className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={privacyHref}
                  >
                    privacy policy
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
                <Checkbox.Root name="remember" size="sm" disabled={inert}>
                  <Checkbox.Control>
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Control>
                  <Checkbox.Label>Remember me</Checkbox.Label>
                  <Checkbox.HiddenInput />
                </Checkbox.Root>

                <a
                  className="rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={forgotHref}
                >
                  Forgot your password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              variant={confirming ? "secondary" : "primary"}
              className="w-full"
              disabled={inert}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  />
                  {busyLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </form>
        </Card.Content>

        {/*
          One footer, and the way out of the card is the same shape in all four
          modes: a question and the link that answers it. Only `sign-in` sends
          the reader onward to an account they do not have yet; the other three
          send them back to the one they do.
        */}
        <Card.Footer className="justify-center">
          <p className="text-sm text-muted-foreground">
            {cardCopy[mode].footerPrompt}{" "}
            <a
              className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={mode === "sign-in" ? signUpHref : signInHref}
            >
              {mode === "sign-in" ? "Create an account" : "Sign in"}
            </a>
          </p>
        </Card.Footer>
      </Card.Root>
    </section>
  );
}
