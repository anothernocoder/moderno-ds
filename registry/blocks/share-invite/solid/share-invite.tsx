import { For, Match, Show, Switch, createSignal } from "solid-js";
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
} from "@moderno-ui/solid";

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

export function ShareInvite(props: ShareInviteProps) {
  const heading = () => props.heading ?? "Share this project";
  const description = () => props.description ?? "Invite people by email, or send them the link.";
  const link = () => props.link ?? "https://example.com/share/q3-planning";
  const members = () => props.members ?? sampleMembers;
  const channels = () => props.channels ?? sampleChannels;
  const disabled = () => Boolean(props.disabled);

  const toaster = createToaster({ placement: "bottom-end" });
  const [inviteError, setInviteError] = createSignal("");
  const [sending, setSending] = createSignal(false);

  async function invite(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!emailPattern.test(email)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    if (members().some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      setInviteError(`${email} already has access.`);
      return;
    }
    setInviteError("");
    setSending(true);
    try {
      await props.onInvite?.(email);
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
      await navigator.clipboard.writeText(link());
      props.onCopy?.(link());
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
      await props.onShare?.(channel.value, link());
      toaster.success({ title: `Shared to ${channel.label}` });
    } catch {
      toaster.error({ title: `Could not share to ${channel.label}` });
    }
  }

  return (
    <>
      <section class="@container moderno-block-share-invite text-foreground">
        <Card.Root>
          <Card.Header>
            <Card.Title>{heading()}</Card.Title>
            <Show when={description()}>
              <Card.Description>{description()}</Card.Description>
            </Show>
          </Card.Header>

          <Card.Content>
            <Switch>
              <Match when={props.error}>
                <Alert.Root variant="error">
                  <Alert.Content>
                    <Alert.Title>{props.error}</Alert.Title>
                    <Alert.Description>
                      Nothing was changed. The people with access keep it.
                    </Alert.Description>
                    <Alert.Action>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled()}
                        onClick={() => props.onRetry?.()}
                      >
                        Try again
                      </Button>
                    </Alert.Action>
                  </Alert.Content>
                </Alert.Root>
              </Match>

              <Match when={props.loading}>
                <div role="status" aria-busy="true" class="relative grid gap-8 @lg:grid-cols-2">
                  <span class="sr-only">Loading sharing settings…</span>
                  <div aria-hidden="true" class="grid content-start gap-4">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="rect" class="h-10 w-full" />
                    <For each={placeholders}>
                      {() => (
                        <div class="flex items-center gap-3">
                          <Skeleton shape="circle" class="size-8 shrink-0" />
                          <div class="grid flex-1 gap-2">
                            <Skeleton shape="text" class="w-1/2" />
                            <Skeleton shape="text" class="w-2/3" />
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                  <div aria-hidden="true" class="grid content-start gap-4">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="rect" class="h-10 w-full" />
                  </div>
                </div>
              </Match>

              <Match when={true}>
                <div class="grid gap-8 @lg:grid-cols-2">
                  <div class="grid content-start gap-6">
                    <div class="grid gap-3">
                      <h4 class="text-body font-medium">Invite people</h4>
                      <form
                        class="grid gap-3 @sm:flex @sm:items-start"
                        noValidate
                        onSubmit={invite}
                      >
                        <Field.Root
                          invalid={Boolean(inviteError())}
                          disabled={disabled() || sending()}
                          class="relative min-w-0 @sm:flex-1"
                        >
                          <Field.Label class="sr-only">Email address to invite</Field.Label>
                          <Field.Input
                            name="email"
                            type="email"
                            autocomplete="email"
                            placeholder="name@company.com"
                            onInput={() => setInviteError("")}
                          />
                          <Field.ErrorText>{inviteError()}</Field.ErrorText>
                        </Field.Root>
                        <Button
                          type="submit"
                          disabled={disabled() || sending()}
                          aria-busy={sending()}
                          class="@sm:shrink-0"
                        >
                          <Show when={sending()} fallback="Invite">
                            <Spinner size="sm" aria-hidden="true" />
                            Sending
                          </Show>
                        </Button>
                      </form>
                    </div>

                    <div class="grid gap-3">
                      <p class="text-ui-sm font-medium text-muted-foreground">People with access</p>
                      <Show
                        when={members().length > 0}
                        fallback={
                          <div class="grid gap-1 rounded-md border border-dashed border-border px-4 py-6 text-center">
                            <p class="text-ui-md font-medium">Only you have access</p>
                            <p class="text-ui-sm text-muted-foreground">
                              People you invite show up here.
                            </p>
                          </div>
                        }
                      >
                        <ul
                          aria-label="People with access"
                          class="grid gap-4 @md:grid-cols-2 @md:gap-x-6 @lg:grid-cols-1"
                        >
                          <For each={members()}>
                            {(member) => (
                              <li class="flex min-w-0 items-center gap-3">
                                <Avatar.Root size="sm">
                                  <Avatar.Fallback>{initialsOf(member.name)}</Avatar.Fallback>
                                </Avatar.Root>
                                <div class="grid min-w-0 flex-1">
                                  <p class="truncate text-ui-md font-medium">{member.name}</p>
                                  <p class="truncate text-ui-sm text-muted-foreground">
                                    {member.email}
                                  </p>
                                </div>
                                <Badge size="sm" class="shrink-0">
                                  {member.role}
                                </Badge>
                              </li>
                            )}
                          </For>
                        </ul>
                      </Show>
                    </div>
                  </div>

                  <div class="grid content-start gap-6">
                    <div class="grid gap-3">
                      <h4 class="text-body font-medium">Share a link</h4>
                      <div class="grid gap-3 @sm:flex @sm:items-start">
                        <Field.Root class="relative min-w-0 @sm:flex-1">
                          <Field.Label class="sr-only">Share link</Field.Label>
                          <Field.Input readOnly value={link()} />
                        </Field.Root>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={disabled()}
                          class="@sm:shrink-0"
                          onClick={copyLink}
                        >
                          Copy link
                        </Button>
                      </div>
                    </div>

                    <Show when={channels().length > 0}>
                      <div class="grid gap-3">
                        <p class="text-ui-sm font-medium text-muted-foreground">Share to</p>
                        <div
                          role="group"
                          aria-label="Share to"
                          class="grid grid-cols-2 gap-2 @sm:grid-cols-4 @lg:grid-cols-2"
                        >
                          <For each={channels()}>
                            {(channel) => (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={disabled()}
                                onClick={() => share(channel)}
                              >
                                {channel.label}
                              </Button>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>
                  </div>
                </div>
              </Match>
            </Switch>
          </Card.Content>
        </Card.Root>
      </section>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Show when={toast().description}>
              <Toast.Description>{toast().description}</Toast.Description>
            </Show>
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
