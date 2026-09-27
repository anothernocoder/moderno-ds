<script lang="ts">
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
  } from "@moderno-ui/svelte";

  interface ShareInviteMember {
    id: string;
    name: string;
    email: string;
    role: string;
  }

  interface ShareInviteChannel {
    value: string;
    label: string;
  }

  interface Props {
    heading?: string;
    description?: string;
    link?: string;
    members?: ShareInviteMember[];
    channels?: ShareInviteChannel[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    oninvite?: (email: string) => void | Promise<void>;
    onshare?: (channel: string, link: string) => void | Promise<void>;
    oncopy?: (link: string) => void;
    onretry?: () => void;
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

  let {
    heading = "Share this project",
    description = "Invite people by email, or send them the link.",
    link = "https://example.com/share/q3-planning",
    members = sampleMembers,
    channels = sampleChannels,
    error,
    loading = false,
    disabled = false,
    oninvite,
    onshare,
    oncopy,
    onretry,
  }: Props = $props();

  const toaster = createToaster({ placement: "bottom-end" });
  let inviteError = $state("");
  let sending = $state(false);

  async function invite(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!emailPattern.test(email)) {
      inviteError = "Enter a valid email address.";
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      inviteError = `${email} already has access.`;
      return;
    }
    inviteError = "";
    sending = true;
    try {
      await oninvite?.(email);
      form.reset();
      toaster.success({ title: "Invite sent", description: `${email} will get an email to join.` });
    } catch {
      toaster.error({ title: "Invite not sent", description: `We could not invite ${email}.` });
    } finally {
      sending = false;
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      oncopy?.(link);
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
      await onshare?.(channel.value, link);
      toaster.success({ title: `Shared to ${channel.label}` });
    } catch {
      toaster.error({ title: `Could not share to ${channel.label}` });
    }
  }
</script>

<section class="@container moderno-block-share-invite text-foreground">
  <Card.Root>
    <Card.Header>
      <Card.Title>{heading}</Card.Title>
      {#if description}
        <Card.Description>{description}</Card.Description>
      {/if}
    </Card.Header>

    <Card.Content>
      {#if error}
        <Alert.Root variant="error">
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>Nothing was changed. The people with access keep it.</Alert.Description>
            <Alert.Action>
              <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
      {:else if loading}
        <div role="status" aria-busy="true" class="relative grid gap-8 @lg:grid-cols-2">
          <span class="sr-only">Loading sharing settings…</span>
          <div aria-hidden="true" class="grid content-start gap-4">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="rect" class="h-10 w-full" />
            {#each placeholders as key (key)}
              <div class="flex items-center gap-3">
                <Skeleton shape="circle" class="size-8 shrink-0" />
                <div class="grid flex-1 gap-2">
                  <Skeleton shape="text" class="w-1/2" />
                  <Skeleton shape="text" class="w-2/3" />
                </div>
              </div>
            {/each}
          </div>
          <div aria-hidden="true" class="grid content-start gap-4">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="rect" class="h-10 w-full" />
          </div>
        </div>
      {:else}
        <div class="grid gap-8 @lg:grid-cols-2">
          <div class="grid content-start gap-6">
            <div class="grid gap-3">
              <h4 class="text-body font-medium">Invite people</h4>
              <form class="grid gap-3 @sm:flex @sm:items-start" novalidate onsubmit={invite}>
                <Field.Root
                  invalid={Boolean(inviteError)}
                  disabled={disabled || sending}
                  class="relative min-w-0 @sm:flex-1"
                >
                  <Field.Label class="sr-only">Email address to invite</Field.Label>
                  <Field.Input
                    name="email"
                    type="email"
                    autocomplete="email"
                    placeholder="name@company.com"
                    oninput={() => (inviteError = "")}
                  />
                  <Field.ErrorText>{inviteError}</Field.ErrorText>
                </Field.Root>
                <Button
                  type="submit"
                  disabled={disabled || sending}
                  aria-busy={sending}
                  class="@sm:shrink-0"
                >
                  {#if sending}
                    <Spinner size="sm" aria-hidden="true" />
                    Sending
                  {:else}
                    Invite
                  {/if}
                </Button>
              </form>
            </div>

            <div class="grid gap-3">
              <p class="text-ui-sm font-medium text-muted-foreground">People with access</p>
              {#if members.length === 0}
                <div
                  class="grid gap-1 rounded-md border border-dashed border-border px-4 py-6 text-center"
                >
                  <p class="text-ui-md font-medium">Only you have access</p>
                  <p class="text-ui-sm text-muted-foreground">People you invite show up here.</p>
                </div>
              {:else}
                <ul
                  aria-label="People with access"
                  class="grid gap-4 @md:grid-cols-2 @md:gap-x-6 @lg:grid-cols-1"
                >
                  {#each members as member (member.id)}
                    <li class="flex min-w-0 items-center gap-3">
                      <Avatar.Root size="sm">
                        <Avatar.Fallback>{initialsOf(member.name)}</Avatar.Fallback>
                      </Avatar.Root>
                      <div class="grid min-w-0 flex-1">
                        <p class="truncate text-ui-md font-medium">{member.name}</p>
                        <p class="truncate text-ui-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge size="sm" class="shrink-0">{member.role}</Badge>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>

          <div class="grid content-start gap-6">
            <div class="grid gap-3">
              <h4 class="text-body font-medium">Share a link</h4>
              <div class="grid gap-3 @sm:flex @sm:items-start">
                <Field.Root class="relative min-w-0 @sm:flex-1">
                  <Field.Label class="sr-only">Share link</Field.Label>
                  <Field.Input readonly value={link} />
                </Field.Root>
                <Button
                  type="button"
                  variant="outline"
                  {disabled}
                  class="@sm:shrink-0"
                  onclick={copyLink}
                >
                  Copy link
                </Button>
              </div>
            </div>

            {#if channels.length > 0}
              <div class="grid gap-3">
                <p class="text-ui-sm font-medium text-muted-foreground">Share to</p>
                <div
                  role="group"
                  aria-label="Share to"
                  class="grid grid-cols-2 gap-2 @sm:grid-cols-4 @lg:grid-cols-2"
                >
                  {#each channels as channel (channel.value)}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      {disabled}
                      onclick={() => share(channel)}
                    >
                      {channel.label}
                    </Button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</section>

<Toaster {toaster}>
  {#snippet children(toast)}
    <Toast.Root>
      <Toast.Title>{toast().title}</Toast.Title>
      {#if toast().description}
        <Toast.Description>{toast().description}</Toast.Description>
      {/if}
    </Toast.Root>
  {/snippet}
</Toaster>
