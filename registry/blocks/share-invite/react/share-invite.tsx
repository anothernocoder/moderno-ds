import { useState, type FormEvent } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Skeleton,
  Spinner,
  Toast,
  Toaster,
  createToaster,
} from "@moderno-ui/react";

export interface ShareInviteMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ShareInviteChannel {
  value: string;
  label: string;
}

const sampleMembers: ShareInviteMember[] = [
  { id: "ana", name: "Ana Ruiz", email: "ana.ruiz@example.com", role: "Owner" },
  { id: "leo", name: "Leo Park", email: "leo.park@example.com", role: "Can edit" },
  { id: "mia", name: "Mia Chen", email: "mia.chen@example.com", role: "Can view" },
];

const sampleChannels: ShareInviteChannel[] = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const placeholders = ["first", "second", "third"];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export interface ShareInviteProps {
  heading?: string;
  description?: string;
  link?: string;
  members?: ShareInviteMember[];
  channels?: ShareInviteChannel[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onInvite?: (email: string) => void | Promise<void>;
  onShare?: (channel: string, link: string) => void | Promise<void>;
  onCopy?: (link: string) => void;
  onRetry?: () => void;
}

export function ShareInvite({
  heading = "Share this project",
  description = "Invite people by email, or send them the link.",
  link = "https://example.com/share/q3-planning",
  members = sampleMembers,
  channels = sampleChannels,
  error,
  loading = false,
  disabled = false,
  onInvite,
  onShare,
  onCopy,
  onRetry,
}: ShareInviteProps) {
  const [toaster] = useState(() => createToaster({ placement: "bottom-end" }));
  const [inviteError, setInviteError] = useState("");
  const [sending, setSending] = useState(false);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!emailPattern.test(email)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      setInviteError(`${email} already has access.`);
      return;
    }
    setInviteError("");
    setSending(true);
    try {
      await onInvite?.(email);
      form.reset();
      toaster.success({ title: "Invite sent", description: `${email} will get an email to join.` });
    } catch {
      toaster.error({ title: "Invite not sent", description: `We could not invite ${email}.` });
    } finally {
      setSending(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      onCopy?.(link);
      toaster.success({ title: "Link copied" });
    } catch {
      toaster.error({
        title: "Could not copy the link",
        description: "Select the link and copy it by hand.",
      });
    }
  }

  async function share(channel: ShareInviteChannel) {
    try {
      await onShare?.(channel.value, link);
      toaster.success({ title: `Shared to ${channel.label}` });
    } catch {
      toaster.error({ title: `Could not share to ${channel.label}` });
    }
  }

  return (
    <>
      <section className="@container moderno-block-share-invite text-foreground">
        <Card.Root>
          <Card.Header>
            <Card.Title>{heading}</Card.Title>
            {description ? <Card.Description>{description}</Card.Description> : null}
          </Card.Header>

          <Card.Content>
            {error ? (
              <Alert.Root variant="error">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>
                    Nothing was changed. The people with access keep it.
                  </Alert.Description>
                  <Alert.Action>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={onRetry}
                    >
                      Try again
                    </Button>
                  </Alert.Action>
                </Alert.Content>
              </Alert.Root>
            ) : loading ? (
              <div role="status" aria-busy="true" className="relative grid gap-8 @lg:grid-cols-2">
                <span className="sr-only">Loading sharing settings…</span>
                <div aria-hidden="true" className="grid content-start gap-4">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="rect" className="h-10 w-full" />
                  {placeholders.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <Skeleton shape="circle" className="size-8 shrink-0" />
                      <div className="grid flex-1 gap-2">
                        <Skeleton shape="text" className="w-1/2" />
                        <Skeleton shape="text" className="w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
                <div aria-hidden="true" className="grid content-start gap-4">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="rect" className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <div className="grid gap-8 @lg:grid-cols-2">
                <div className="grid content-start gap-6">
                  <div className="grid gap-3">
                    <h4 className="text-body font-medium">Invite people</h4>
                    <form
                      className="grid gap-3 @sm:flex @sm:items-start"
                      noValidate
                      onSubmit={invite}
                    >
                      <Field.Root
                        invalid={Boolean(inviteError)}
                        disabled={disabled || sending}
                        className="relative min-w-0 @sm:flex-1"
                      >
                        <Field.Label className="sr-only">Email address to invite</Field.Label>
                        <Field.Input
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="name@company.com"
                          onInput={() => setInviteError("")}
                        />
                        <Field.ErrorText>{inviteError}</Field.ErrorText>
                      </Field.Root>
                      <Button
                        type="submit"
                        disabled={disabled || sending}
                        aria-busy={sending}
                        className="@sm:shrink-0"
                      >
                        {sending ? (
                          <>
                            <Spinner size="sm" aria-hidden="true" />
                            Sending
                          </>
                        ) : (
                          "Invite"
                        )}
                      </Button>
                    </form>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-ui-sm font-medium text-muted-foreground">
                      People with access
                    </p>
                    {members.length === 0 ? (
                      <div className="grid gap-1 rounded-md border border-dashed border-border px-4 py-6 text-center">
                        <p className="text-ui-md font-medium">Only you have access</p>
                        <p className="text-ui-sm text-muted-foreground">
                          People you invite show up here.
                        </p>
                      </div>
                    ) : (
                      <ul
                        aria-label="People with access"
                        className="grid gap-4 @md:grid-cols-2 @md:gap-x-6 @lg:grid-cols-1"
                      >
                        {members.map((member) => (
                          <li key={member.id} className="flex min-w-0 items-center gap-3">
                            <Avatar.Root size="sm">
                              <Avatar.Fallback>{initialsOf(member.name)}</Avatar.Fallback>
                            </Avatar.Root>
                            <div className="grid min-w-0 flex-1">
                              <p className="truncate text-ui-md font-medium">{member.name}</p>
                              <p className="truncate text-ui-sm text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                            <Badge size="sm" className="shrink-0">
                              {member.role}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid content-start gap-6">
                  <div className="grid gap-3">
                    <h4 className="text-body font-medium">Share a link</h4>
                    <div className="grid gap-3 @sm:flex @sm:items-start">
                      <Field.Root className="relative min-w-0 @sm:flex-1">
                        <Field.Label className="sr-only">Share link</Field.Label>
                        <Field.Input readOnly value={link} />
                      </Field.Root>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className="@sm:shrink-0"
                        onClick={copyLink}
                      >
                        Copy link
                      </Button>
                    </div>
                  </div>

                  {channels.length > 0 ? (
                    <div className="grid gap-3">
                      <p className="text-ui-sm font-medium text-muted-foreground">Share to</p>
                      <div
                        role="group"
                        aria-label="Share to"
                        className="grid grid-cols-2 gap-2 @sm:grid-cols-4 @lg:grid-cols-2"
                      >
                        {channels.map((channel) => (
                          <Button
                            key={channel.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                            onClick={() => share(channel)}
                          >
                            {channel.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </Card.Content>
        </Card.Root>
      </section>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast.title}</Toast.Title>
            {toast.description ? <Toast.Description>{toast.description}</Toast.Description> : null}
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
