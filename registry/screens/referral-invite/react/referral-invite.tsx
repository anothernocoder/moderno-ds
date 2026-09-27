import type { FormEvent, MouseEvent } from "react";
import { Alert, Field } from "@moderno-ui/react";
import { FormLayout } from "@/components/blocks/form-layout";

/**
 * ReferralInvite — the full-viewport screen where a member invites friends by
 * email: what the referral gives, then a form for the addresses and an
 * optional note, between a masthead and a footer. Copy it into your project
 * with `moderno add referral-invite-react`; the block it composes arrives with
 * it, and every file is yours from that moment.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no
 * request, no parsing, no router. It renders the errors, busy state and sent
 * addresses it is handed and reports what the reader did — `onSubmit` /
 * `onCancel` for the form and `onNavigate` for every link it draws itself.
 * Splitting the addresses, checking them and sending the invites stays in the
 * page that mounts this.
 *
 * The addresses are one textarea named `emails`: people paste lists, and a
 * textarea takes a list from a spreadsheet or a contacts export as it is.
 * Split it on commas and new lines in your submit handler.
 *
 * Links carry an `href` and call `onNavigate(destination, event)` on top: a
 * client router can `preventDefault()` — after reading `metaKey` to leave a
 * ctrl/cmd-click to the browser — while the markup still works without
 * JavaScript.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide the
 * `main` landmark. If your route has none, make this element your `<main>`.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). Full-viewport
 * is a *height* — `min-h-dvh` — and every width decision is read off the
 * screen's own `@container`:
 *
 * - `@sm` (`--container-sm`, 24rem) — the masthead stops stacking: the
 *   wordmark shares a row with "How referrals work".
 * - `@md` (`--container-md`, 36rem) — the title grows, the three steps sit side
 *   by side and the footer stops stacking.
 *
 * **States.** `sent` lists the addresses the last send reached, in a success
 * alert above the form; without it nothing has been sent yet. `error`,
 * `errors`, `loading` and `disabled` go to the form.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type ReferralInviteDestination = "home" | "rules" | "privacy" | "terms";

export interface ReferralInviteProps {
  /** Addresses the last send reached. Shown in a success alert above the form. */
  sent?: string[];
  /** Sending failed. Raises the form-level alert. */
  error?: string;
  /** Field errors keyed by name: `emails`, `message`. */
  errors?: Record<string, string>;
  /** The send is in flight: every control is inert and the send button reads busy. */
  loading?: boolean;
  /** No invites can be sent right now. */
  disabled?: boolean;
  /** Native submit; call `event.preventDefault()` and read the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** The form's "Not now" button was pressed. */
  onCancel?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (
    destination: ReferralInviteDestination,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "How referrals work" points. */
  rulesHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function ReferralInvite({
  sent,
  error,
  errors,
  loading = false,
  disabled = false,
  onSubmit,
  onCancel,
  onNavigate,
  homeHref = "#",
  rulesHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: ReferralInviteProps) {
  const inert = loading || disabled;

  return (
    <div className="@container moderno-screen-referral-invite min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header className="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            className="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={homeHref}
            onClick={(event) => onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <a
            className="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={rulesHref}
            onClick={(event) => onNavigate?.("rules", event)}
          >
            How referrals work
          </a>
        </header>

        <div className="mx-auto grid w-full max-w-3xl content-start gap-8">
          <div className="grid gap-1">
            <h1 className="text-heading-sm font-semibold tracking-tight @md:text-heading">
              Invite your friends
            </h1>
            <p className="text-ui-md text-muted-foreground">
              Each friend who joins with your invite gets a month of Pro free, and so do you.
            </p>
          </div>

          <ol aria-label="How it works" className="grid gap-4 @md:grid-cols-3">
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-ui-sm font-semibold"
              >
                1
              </span>
              <div className="grid gap-1">
                <p className="text-ui-md font-medium">Add their emails</p>
                <p className="text-ui-md text-muted-foreground">Up to 10 friends at a time.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-ui-sm font-semibold"
              >
                2
              </span>
              <div className="grid gap-1">
                <p className="text-ui-md font-medium">They join Moderno</p>
                <p className="text-ui-md text-muted-foreground">
                  Your invite link is in the email we send.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-ui-sm font-semibold"
              >
                3
              </span>
              <div className="grid gap-1">
                <p className="text-ui-md font-medium">You both get a month</p>
                <p className="text-ui-md text-muted-foreground">
                  Added to your plan once they sign up.
                </p>
              </div>
            </li>
          </ol>

          {sent?.length ? (
            <Alert.Root variant="success" size="sm">
              <Alert.Content>
                <Alert.Title>Invites sent</Alert.Title>
                <Alert.Description>
                  We emailed {sent.join(", ")}. You get a month free for each one who joins.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          ) : null}

          <FormLayout
            title="Send invites"
            description="We email each friend your invite link. Nothing else is shared."
            submitLabel="Send invites"
            pendingLabel="Sending"
            cancelLabel="Not now"
            error={error}
            errors={errors}
            loading={loading}
            disabled={disabled}
            onSubmit={onSubmit}
            onCancel={onCancel}
          >
            <div className="grid gap-6 @lg:grid-cols-3">
              <header className="grid content-start gap-1">
                <h3 className="text-ui-md font-medium">Friends</h3>
                <p className="text-ui-md text-muted-foreground">
                  Who should get an invite from you.
                </p>
              </header>

              <div className="grid gap-5 @lg:col-span-2">
                <Field.Root required invalid={Boolean(errors?.emails)} disabled={inert}>
                  <Field.Label>Email addresses</Field.Label>
                  <Field.Textarea
                    name="emails"
                    autoComplete="off"
                    placeholder="ada@example.com, grace@example.com"
                  />
                  <Field.HelperText>
                    Separate addresses with commas or new lines. Up to 10 at a time.
                  </Field.HelperText>
                  <Field.ErrorText>{errors?.emails}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={Boolean(errors?.message)} disabled={inert}>
                  <Field.Label>Personal note</Field.Label>
                  <Field.Textarea
                    name="message"
                    placeholder="I plan my week in Moderno. Thought you'd like it too."
                  />
                  <Field.HelperText>Optional. We add it above your invite link.</Field.HelperText>
                  <Field.ErrorText>{errors?.message}</Field.ErrorText>
                </Field.Root>
              </div>
            </div>
          </FormLayout>
        </div>

        <footer className="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
          <p>© Moderno</p>
          <nav className="flex gap-4" aria-label="Legal">
            <a
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={privacyHref}
              onClick={(event) => onNavigate?.("privacy", event)}
            >
              Privacy
            </a>
            <a
              className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={termsHref}
              onClick={(event) => onNavigate?.("terms", event)}
            >
              Terms
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
