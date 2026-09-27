<script setup lang="ts">
import { computed, ref } from "vue";
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
} from "@moderno-ui/vue";

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

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    heading: "Share this project",
    description: "Invite people by email, or send them the link.",
    link: "https://example.com/share/q3-planning",
    members: undefined,
    channels: undefined,
    error: undefined,
    loading: false,
    disabled: false,
    onInvite: undefined,
    onShare: undefined,
  },
);

const emit = defineEmits<{
  copy: [link: string];
  retry: [];
}>();

// Not a `withDefaults` factory: the SFC compiler rejects defaults that read a local const.
const resolvedMembers = computed(() => props.members ?? sampleMembers);
const resolvedChannels = computed(() => props.channels ?? sampleChannels);

const toaster = createToaster({ placement: "bottom-end" });
const inviteError = ref("");
const sending = ref(false);

async function invite(event: Event) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const email = String(new FormData(form).get("email") ?? "").trim();
  if (!emailPattern.test(email)) {
    inviteError.value = "Enter a valid email address.";
    return;
  }
  if (resolvedMembers.value.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
    inviteError.value = `${email} already has access.`;
    return;
  }
  inviteError.value = "";
  sending.value = true;
  try {
    await props.onInvite?.(email);
    form.reset();
    toaster.success({ title: "Invite sent", description: `${email} will get an email to join.` });
  } catch {
    toaster.error({ title: "Invite not sent", description: `We could not invite ${email}.` });
  } finally {
    sending.value = false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.link);
    emit("copy", props.link);
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
    await props.onShare?.(channel.value, props.link);
    toaster.success({ title: `Shared to ${channel.label}` });
  } catch {
    toaster.error({ title: `Could not share to ${channel.label}` });
  }
}
</script>

<template>
  <section class="@container moderno-block-share-invite text-foreground">
    <Card.Root>
      <Card.Header>
        <Card.Title>{{ heading }}</Card.Title>
        <Card.Description v-if="description">{{ description }}</Card.Description>
      </Card.Header>

      <Card.Content>
        <Alert.Root v-if="error" variant="error">
          <Alert.Content>
            <Alert.Title>{{ error }}</Alert.Title>
            <Alert.Description
              >Nothing was changed. The people with access keep it.</Alert.Description
            >
            <Alert.Action>
              <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                @click="emit('retry')"
              >
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>

        <div
          v-else-if="loading"
          role="status"
          aria-busy="true"
          class="relative grid gap-8 @lg:grid-cols-2"
        >
          <span class="sr-only">Loading sharing settings…</span>
          <div aria-hidden="true" class="grid content-start gap-4">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="rect" class="h-10 w-full" />
            <div v-for="key in placeholders" :key="key" class="flex items-center gap-3">
              <Skeleton shape="circle" class="size-8 shrink-0" />
              <div class="grid flex-1 gap-2">
                <Skeleton shape="text" class="w-1/2" />
                <Skeleton shape="text" class="w-2/3" />
              </div>
            </div>
          </div>
          <div aria-hidden="true" class="grid content-start gap-4">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="rect" class="h-10 w-full" />
          </div>
        </div>

        <div v-else class="grid gap-8 @lg:grid-cols-2">
          <div class="grid content-start gap-6">
            <div class="grid gap-3">
              <h4 class="text-body font-medium">Invite people</h4>
              <form class="grid gap-3 @sm:flex @sm:items-start" novalidate @submit="invite">
                <Field.Root
                  :invalid="Boolean(inviteError)"
                  :disabled="disabled || sending"
                  class="relative min-w-0 @sm:flex-1"
                >
                  <Field.Label class="sr-only">Email address to invite</Field.Label>
                  <Field.Input
                    name="email"
                    type="email"
                    autocomplete="email"
                    placeholder="name@company.com"
                    @input="inviteError = ''"
                  />
                  <Field.ErrorText>{{ inviteError }}</Field.ErrorText>
                </Field.Root>
                <Button
                  type="submit"
                  :disabled="disabled || sending"
                  :aria-busy="sending"
                  class="@sm:shrink-0"
                >
                  <template v-if="sending">
                    <Spinner size="sm" aria-hidden="true" />
                    Sending
                  </template>
                  <template v-else>Invite</template>
                </Button>
              </form>
            </div>

            <div class="grid gap-3">
              <p class="text-ui-sm font-medium text-muted-foreground">People with access</p>
              <div
                v-if="resolvedMembers.length === 0"
                class="grid gap-1 rounded-md border border-dashed border-border px-4 py-6 text-center"
              >
                <p class="text-ui-md font-medium">Only you have access</p>
                <p class="text-ui-sm text-muted-foreground">People you invite show up here.</p>
              </div>
              <ul
                v-else
                aria-label="People with access"
                class="grid gap-4 @md:grid-cols-2 @md:gap-x-6 @lg:grid-cols-1"
              >
                <li
                  v-for="member in resolvedMembers"
                  :key="member.id"
                  class="flex min-w-0 items-center gap-3"
                >
                  <Avatar.Root size="sm">
                    <Avatar.Fallback>{{ initialsOf(member.name) }}</Avatar.Fallback>
                  </Avatar.Root>
                  <div class="grid min-w-0 flex-1">
                    <p class="truncate text-ui-md font-medium">{{ member.name }}</p>
                    <p class="truncate text-ui-sm text-muted-foreground">{{ member.email }}</p>
                  </div>
                  <Badge size="sm" class="shrink-0">{{ member.role }}</Badge>
                </li>
              </ul>
            </div>
          </div>

          <div class="grid content-start gap-6">
            <div class="grid gap-3">
              <h4 class="text-body font-medium">Share a link</h4>
              <div class="grid gap-3 @sm:flex @sm:items-start">
                <Field.Root class="relative min-w-0 @sm:flex-1">
                  <Field.Label class="sr-only">Share link</Field.Label>
                  <Field.Input readonly :value="link" />
                </Field.Root>
                <Button
                  type="button"
                  variant="outline"
                  :disabled="disabled"
                  class="@sm:shrink-0"
                  @click="copyLink"
                >
                  Copy link
                </Button>
              </div>
            </div>

            <div v-if="resolvedChannels.length > 0" class="grid gap-3">
              <p class="text-ui-sm font-medium text-muted-foreground">Share to</p>
              <div
                role="group"
                aria-label="Share to"
                class="grid grid-cols-2 gap-2 @sm:grid-cols-4 @lg:grid-cols-2"
              >
                <Button
                  v-for="channel in resolvedChannels"
                  :key="channel.value"
                  type="button"
                  variant="outline"
                  size="sm"
                  :disabled="disabled"
                  @click="share(channel)"
                >
                  {{ channel.label }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </section>

  <Toaster v-slot="toast" :toaster="toaster">
    <Toast.Root>
      <Toast.Title>{{ toast.title }}</Toast.Title>
      <Toast.Description v-if="toast.description">{{ toast.description }}</Toast.Description>
    </Toast.Root>
  </Toaster>
</template>
