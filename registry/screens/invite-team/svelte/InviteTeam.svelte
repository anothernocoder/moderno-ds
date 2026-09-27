<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Alert, Button, Field } from "@moderno-ui/svelte";
  import List from "@/components/blocks/List.svelte";

  type InviteTeamDestination = "home" | "skip" | "privacy" | "terms";

  type Invite = NonNullable<ComponentProps<typeof List>["items"]>[number];

  interface Props {
    /** The invites nobody has accepted yet. Leave it out for sample invites; `[]` is the empty state. */
    invites?: Invite[];
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
    onsubmit?: (event: SubmitEvent) => void;
    /** A pending invite's Edit button was pressed, with that invite's `id`. */
    oneditinvite?: (id: string) => void;
    /** A pending invite's Remove button was pressed, with that invite's `id`. */
    onremoveinvite?: (id: string) => void;
    /** "Try again" after `invitesError`. */
    onretry?: () => void;
    /** The reader is done inviting. */
    oncontinue?: () => void;
    /**
     * A link the screen draws itself was activated, with the click event that
     * did it: `preventDefault()` on it to route without a document navigation,
     * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
     */
    onnavigate?: (destination: InviteTeamDestination, event: MouseEvent) => void;
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Skip for now" points. */
    skipHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }

  const sampleInvites: Invite[] = [
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

  let {
    invites = sampleInvites,
    invitesLoading = false,
    invitesError,
    sendError,
    emailsError,
    sending = false,
    disabled = false,
    onsubmit,
    oneditinvite,
    onremoveinvite,
    onretry,
    oncontinue,
    onnavigate,
    homeHref = "#",
    skipHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

  let form: HTMLFormElement | undefined = $state();
  const formInert = $derived(sending || disabled);

  // The list's "Invite member" button leads to the field this screen already shows.
  function focusEmails() {
    const emails = form?.elements.namedItem("emails");
    if (emails instanceof HTMLInputElement) emails.focus();
  }
</script>

<div class="@container moderno-screen-invite-team min-h-dvh bg-background text-foreground">
  <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
    <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
      <a
        class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={homeHref}
        onclick={(event) => onnavigate?.("home", event)}
      >
        Moderno
      </a>
      <a
        class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href={skipHref}
        onclick={(event) => onnavigate?.("skip", event)}
      >
        Skip for now
      </a>
    </header>

    <div class="mx-auto grid w-full max-w-3xl content-start gap-8">
      <div class="grid gap-1">
        <h1 class="text-heading-sm font-semibold tracking-tight @md:text-heading">
          Invite your team
        </h1>
        <p class="text-ui-md text-muted-foreground">
          Add your teammates by email. Each one gets a link to join, and can accept it later.
        </p>
      </div>

      <form bind:this={form} class="grid gap-4" {onsubmit} novalidate>
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">Send invites</h2>

        {#if sendError}
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{sendError}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        {/if}

        <Field.Root required invalid={Boolean(emailsError)} disabled={formInert}>
          <Field.Label>Email addresses</Field.Label>
          <Field.Input
            name="emails"
            type="email"
            multiple
            autocomplete="off"
            placeholder="ana@company.com, ben@company.com"
          />
          <Field.HelperText>Separate several addresses with commas.</Field.HelperText>
          <Field.ErrorText>{emailsError}</Field.ErrorText>
        </Field.Root>

        <div class="grid gap-3 @sm:flex @sm:justify-end">
          <Button type="submit" disabled={formInert} aria-busy={sending}>
            {#if sending}
              <span
                aria-hidden="true"
                class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              ></span>
              Sending
            {:else}
              Send invites
            {/if}
          </Button>
        </div>
      </form>

      <List
        heading="Pending invites"
        description="People you invited who have not joined yet."
        items={invites}
        loading={invitesLoading}
        error={invitesError}
        {disabled}
        oninvite={focusEmails}
        onedit={oneditinvite}
        onremove={onremoveinvite}
        {onretry}
      />

      <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
        <p class="text-ui-md text-muted-foreground">
          You can invite more people later from your workspace settings.
        </p>
        <Button type="button" variant="secondary" {disabled} onclick={() => oncontinue?.()}>
          Continue
        </Button>
      </div>
    </div>

    <footer
      class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between"
    >
      <p>© Moderno</p>
      <nav class="flex gap-4" aria-label="Legal">
        <a
          class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={privacyHref}
          onclick={(event) => onnavigate?.("privacy", event)}
        >
          Privacy
        </a>
        <a
          class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href={termsHref}
          onclick={(event) => onnavigate?.("terms", event)}
        >
          Terms
        </a>
      </nav>
    </footer>
  </div>
</div>
