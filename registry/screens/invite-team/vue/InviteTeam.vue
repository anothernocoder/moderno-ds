<script setup lang="ts">
import { computed, ref } from "vue";
import { Alert, Button, Field, type BadgeVariant } from "@moderno-ui/vue";
import List from "@/components/blocks/List.vue";

type InviteTeamDestination = "home" | "skip" | "privacy" | "terms";

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  avatarUrl?: string;
  status?: string;
  statusVariant?: BadgeVariant;
  meta?: string;
}

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

const props = withDefaults(
  defineProps<{
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
    /** Where the wordmark points. */
    homeHref?: string;
    /** Where "Skip for now" points. */
    skipHref?: string;
    /** Where the privacy link points. */
    privacyHref?: string;
    /** Where the terms link points. */
    termsHref?: string;
  }>(),
  {
    invites: undefined,
    invitesLoading: false,
    invitesError: undefined,
    sendError: undefined,
    emailsError: undefined,
    sending: false,
    disabled: false,
    homeHref: "#",
    skipHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

/**
 * `submit` is the native form event (read `emails` from the form yourself);
 * `editInvite` and `removeInvite` carry the invite's `id`; `navigate` names the
 * destination of a link the screen draws itself with the click event that did
 * it, so the listener can `preventDefault()`.
 */
const emit = defineEmits<{
  submit: [event: Event];
  editInvite: [id: string];
  removeInvite: [id: string];
  retry: [];
  continue: [];
  navigate: [destination: InviteTeamDestination, event: MouseEvent];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedInvites = computed(() => props.invites ?? sampleInvites);

const form = ref<HTMLFormElement | null>(null);
const formInert = computed(() => props.sending || props.disabled);

// The list's "Invite member" button leads to the field this screen already shows.
function focusEmails() {
  const emails = form.value?.elements.namedItem("emails");
  if (emails instanceof HTMLInputElement) emails.focus();
}
</script>

<template>
  <div class="@container moderno-screen-invite-team min-h-dvh bg-background text-foreground">
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
      <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
        <a
          class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="homeHref"
          @click="emit('navigate', 'home', $event)"
        >
          Moderno
        </a>
        <a
          class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          :href="skipHref"
          @click="emit('navigate', 'skip', $event)"
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

        <form ref="form" class="grid gap-4" novalidate @submit="emit('submit', $event)">
          <h2 class="text-body-lg font-semibold @md:text-heading-sm">Send invites</h2>

          <Alert.Root v-if="sendError" variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{{ sendError }}</Alert.Title>
            </Alert.Content>
          </Alert.Root>

          <Field.Root required :invalid="Boolean(emailsError)" :disabled="formInert">
            <Field.Label>Email addresses</Field.Label>
            <Field.Input
              name="emails"
              type="email"
              multiple
              autocomplete="off"
              placeholder="ana@company.com, ben@company.com"
            />
            <Field.HelperText>Separate several addresses with commas.</Field.HelperText>
            <Field.ErrorText>{{ emailsError }}</Field.ErrorText>
          </Field.Root>

          <div class="grid gap-3 @sm:flex @sm:justify-end">
            <Button type="submit" :disabled="formInert" :aria-busy="sending">
              <template v-if="sending">
                <span
                  aria-hidden="true"
                  class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                Sending
              </template>
              <template v-else>Send invites</template>
            </Button>
          </div>
        </form>

        <List
          heading="Pending invites"
          description="People you invited who have not joined yet."
          :items="resolvedInvites"
          :loading="invitesLoading"
          :error="invitesError"
          :disabled="disabled"
          @invite="focusEmails"
          @edit="emit('editInvite', $event)"
          @remove="emit('removeInvite', $event)"
          @retry="emit('retry')"
        />

        <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <p class="text-ui-md text-muted-foreground">
            You can invite more people later from your workspace settings.
          </p>
          <Button type="button" variant="secondary" :disabled="disabled" @click="emit('continue')">
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
            :href="privacyHref"
            @click="emit('navigate', 'privacy', $event)"
          >
            Privacy
          </a>
          <a
            class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            :href="termsHref"
            @click="emit('navigate', 'terms', $event)"
          >
            Terms
          </a>
        </nav>
      </footer>
    </div>
  </div>
</template>
