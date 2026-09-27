import { useRef } from "react";
import type { FormEvent, MouseEvent } from "react";
import { Alert, Button, Field } from "@moderno-ui/react";
import { List, type ListItem } from "@/components/blocks/list";

export type InviteTeamDestination = "home" | "skip" | "privacy" | "terms";

const sampleInvites: ListItem[] = [
  {
    id: "mara-diaz",
    title: "Mara Díaz",
    subtitle: "mara.diaz@example.com",
    initials: "MD",
    status: "Invited",
    statusVariant: "info",
    meta: "Sent today",
  },
  {
    id: "ben-okafor",
    title: "Ben Okafor",
    subtitle: "ben.okafor@example.com",
    initials: "BO",
    status: "Invited",
    statusVariant: "info",
    meta: "Sent 2 days ago",
  },
  {
    id: "sam-patel",
    title: "Sam Patel",
    subtitle: "sam.patel@example.com",
    initials: "SP",
    status: "Expired",
    statusVariant: "neutral",
    meta: "Sent 9 days ago",
  },
];

export interface InviteTeamProps {
  /** The invites nobody has accepted yet. Leave it out for sample invites; `[]` is the empty state. */
  invites?: ListItem[];
  /** The pending invites are on their way: placeholder rows in a busy region. */
  invitesLoading?: boolean;
  /** Loading the pending invites failed: an alert with a retry replaces them. */
  invitesError?: string;
  /** Sending failed. Shown as an alert over the email field. */
  sendError?: string;
  /** What is wrong with the addresses, like one that is not an email. Marks the field invalid. */
  emailsError?: string;
  /** The invites are being sent: the field is inert and the send button reads busy. */
  sending?: boolean;
  /** Nothing on the screen can be used right now. */
  disabled?: boolean;
  /** Native submit; call `event.preventDefault()` and read `emails` from the form yourself. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** A pending invite's Edit button was pressed, with that invite's `id`. */
  onEditInvite?: (id: string) => void;
  /** A pending invite's Remove button was pressed, with that invite's `id`. */
  onRemoveInvite?: (id: string) => void;
  /** "Try again" after `invitesError`. */
  onRetry?: () => void;
  /** The reader is done inviting. */
  onContinue?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: InviteTeamDestination, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Skip for now" points. */
  skipHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function InviteTeam({
  invites = sampleInvites,
  invitesLoading = false,
  invitesError,
  sendError,
  emailsError,
  sending = false,
  disabled = false,
  onSubmit,
  onEditInvite,
  onRemoveInvite,
  onRetry,
  onContinue,
  onNavigate,
  homeHref = "#",
  skipHref = "#",
  privacyHref = "#",
  termsHref = "#",
}: InviteTeamProps) {
  const form = useRef<HTMLFormElement>(null);
  const formInert = sending || disabled;

  // The list's "Invite member" button leads to the field this screen already shows.
  function focusEmails() {
    const emails = form.current?.elements.namedItem("emails");
    if (emails instanceof HTMLInputElement) emails.focus();
  }

  return (
    <div className="@container moderno-screen-invite-team min-h-dvh bg-background text-foreground">
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
            href={skipHref}
            onClick={(event) => onNavigate?.("skip", event)}
          >
            Skip for now
          </a>
        </header>

        <div className="mx-auto grid w-full max-w-3xl content-start gap-8">
          <div className="grid gap-1">
            <h1 className="text-heading-sm font-semibold tracking-tight @md:text-heading">
              Invite your team
            </h1>
            <p className="text-ui-md text-muted-foreground">
              Add your teammates by email. Each one gets a link to join, and can accept it later.
            </p>
          </div>

          <form ref={form} className="grid gap-4" onSubmit={onSubmit} noValidate>
            <h2 className="text-body-lg font-semibold @md:text-heading-sm">Send invites</h2>

            {sendError ? (
              <Alert.Root variant="error" size="sm">
                <Alert.Content>
                  <Alert.Title>{sendError}</Alert.Title>
                </Alert.Content>
              </Alert.Root>
            ) : null}

            <Field.Root required invalid={Boolean(emailsError)} disabled={formInert}>
              <Field.Label>Email addresses</Field.Label>
              <Field.Input
                name="emails"
                type="email"
                multiple
                autoComplete="off"
                placeholder="ana@company.com, ben@company.com"
              />
              <Field.HelperText>Separate several addresses with commas.</Field.HelperText>
              <Field.ErrorText>{emailsError}</Field.ErrorText>
            </Field.Root>

            <div className="grid gap-3 @sm:flex @sm:justify-end">
              <Button type="submit" disabled={formInert} aria-busy={sending}>
                {sending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    />
                    Sending
                  </>
                ) : (
                  "Send invites"
                )}
              </Button>
            </div>
          </form>

          <List
            heading="Pending invites"
            description="People you invited who have not joined yet."
            items={invites}
            loading={invitesLoading}
            error={invitesError}
            disabled={disabled}
            onInvite={focusEmails}
            onEdit={onEditInvite}
            onRemove={onRemoveInvite}
            onRetry={onRetry}
          />

          <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
            <p className="text-ui-md text-muted-foreground">
              You can invite more people later from your workspace settings.
            </p>
            <Button type="button" variant="secondary" disabled={disabled} onClick={onContinue}>
              Continue
            </Button>
          </div>
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
