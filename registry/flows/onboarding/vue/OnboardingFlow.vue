<!--
  OnboardingFlow — the example assembly for the `onboarding` flow: welcome →
  profile-setup → plan-select → invite-team, and the state between them. Copy it
  into your project with `moderno add onboarding-vue`; the four screens and the
  blocks they compose arrive with it, and every file is yours from that moment.

  This is the piece you are expected to rewrite. Every screen under it is
  presentational — props in, events out, no step, no request, no router — so the
  order of the screens, and what each one hands the next, live here.

  What it owns: `step`, which of the four screens is on the route; `name`, typed
  on the profile, greeted on welcome and turned into the avatar's initials;
  `avatarSrc`, the photo the reader picked, shown as a local object URL — it
  stands in for an upload, so replace it with your request and pass back the URL
  your server returns; `plan`, the `id` of the plan chosen; `invites`, the
  addresses sent so far; and `errors` / `emailsError`, whatever the last submit
  rejected, which `go` drops on every move.

  Moving forward. Continue, a saved profile, a chosen plan and each "Skip for
  now" link all call `advance`, which moves to the next step or, on the last
  one, finishes. "Skip for now" on welcome finishes straight away: the reader
  chose to set up later. Skip links are real `href`s (`hrefFor`), so they still
  work without JavaScript; the assembly routes a plain left click and leaves a
  modified click to the browser.

  Where the flow ends. `complete` carries the name, the plan and the invites,
  and the flow returns to its first step. It paints no "all set" page: leaving
  is your router's job.

  Editing a pending invite is left to you: the list draws an Edit button, and
  what it opens depends on what an invite holds in your product.
-->
<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import InviteTeam from "@/components/screens/InviteTeam.vue";
import PlanSelect from "@/components/screens/PlanSelect.vue";
import ProfileSetup from "@/components/screens/ProfileSetup.vue";
import Welcome from "@/components/screens/Welcome.vue";

type OnboardingStep = "welcome" | "profile-setup" | "plan-select" | "invite-team";

/** What the reader set up, carried by `complete` when they leave the flow. */
interface OnboardingResult {
  /** The full name saved on the profile, or the one the flow started with. */
  name: string;
  /** The `id` of the chosen plan; `undefined` when the reader skipped past it. */
  plan?: string;
  /** Every address invited, in the order they were sent. */
  invites: string[];
}

/** A row of the pending-invites list, as the invite-team screen takes it. */
interface Invite {
  id: string;
  title: string;
  subtitle: string;
  initials: string;
  status: string;
  statusVariant: "info";
  meta: string;
}

/** The flow, in order. "Forward" always means the next entry here. */
const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  "welcome",
  "profile-setup",
  "plan-select",
  "invite-team",
];

/** A pragmatic address check, the kind a form can make on its own; your server has the final word. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const props = withDefaults(
  defineProps<{
    /** Which screen the flow opens on — in a real app, whatever the route says. */
    initialStep?: OnboardingStep;
    /** The reader's full name, if sign-up already asked for it. Welcome greets them by the first word. */
    initialName?: string;
    /** The URL each step lives at. Give your router's paths; the default is a fragment per step. */
    hrefFor?: (step: OnboardingStep) => string;
    /** Where the app begins: what "Skip for now" on the last step points at. */
    finishHref?: string;
    /** Where the wordmark points, on every screen. */
    homeHref?: string;
    /** Where "Contact support" points, on the welcome screen. */
    supportHref?: string;
    /** Where "Talk to sales" points, on the plan screen. */
    salesHref?: string;
    /** Where the privacy links point, on every screen. */
    privacyHref?: string;
    /** Where the terms links point, on every screen. */
    termsHref?: string;
  }>(),
  {
    initialStep: "welcome",
    initialName: "",
    hrefFor: undefined,
    finishHref: "#",
    homeHref: "#",
    supportHref: "#",
    salesHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

const emit = defineEmits<{
  /** The flow moved: mirror it in the URL so a reload and the back button land where the reader is. */
  stepChange: [step: OnboardingStep];
  /** The reader is through — finished or skipped. Save the result and take them into the app. */
  complete: [result: OnboardingResult];
}>();

const step = ref<OnboardingStep>(props.initialStep);
const name = ref(props.initialName);
const avatarSrc = ref<string | undefined>(undefined);
const plan = ref<string | undefined>(undefined);
const invites = ref<Invite[]>([]);
const errors = ref<Record<string, string> | undefined>(undefined);
const emailsError = ref<string | undefined>(undefined);

/** Each picked photo is an object URL; release it once it is replaced or the flow unmounts. */
watch(avatarSrc, (_current, previous) => {
  if (previous !== undefined) URL.revokeObjectURL(previous);
});
onUnmounted(() => {
  if (avatarSrc.value !== undefined) URL.revokeObjectURL(avatarSrc.value);
});

function urlFor(target: OnboardingStep): string {
  return props.hrefFor ? props.hrefFor(target) : `#${target}`;
}

/** Up to two capital letters from a full name: "Ada Lovelace" → "AL". */
function initialsOf(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** The row the pending-invites list shows for an address that was just sent. */
function inviteFor(address: string): Invite {
  return {
    id: address,
    title: address.split("@")[0]!,
    subtitle: address,
    initials: address.slice(0, 2).toUpperCase(),
    status: "Invited",
    statusVariant: "info",
    meta: "Sent just now",
  };
}

/** A plain left click, the only kind a client router may take over from the browser. */
function isPlainClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

/** A move, and the one place a step's rejected submit is forgotten. */
function go(next: OnboardingStep) {
  step.value = next;
  errors.value = undefined;
  emailsError.value = undefined;
  emit("stepChange", next);
}

/** The flow's exit: what was set up goes up, and the reader goes wherever you send them. */
function finish() {
  emit("complete", {
    name: name.value,
    plan: plan.value,
    invites: invites.value.map((invite) => invite.id),
  });
  go("welcome");
}

/** One step forward, or out of the flow from the last one. */
function advance() {
  const next = ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step.value) + 1];
  if (next === undefined) finish();
  else go(next);
}

/** The screens' own links: only "Skip for now" belongs to the flow; the rest are the browser's. */
function navigate(destination: string, event: MouseEvent) {
  if (destination !== "skip" || !isPlainClick(event)) return;
  event.preventDefault();
  advance();
}

/** The profile form. There is no server here, so the checks are the ones a form can make. */
function saveProfile(event: Event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget as HTMLFormElement);
  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const rejected: Record<string, string> = {};
  if (fullName === "") rejected.fullName = "Enter your name.";
  if (!EMAIL.test(email)) rejected.email = "Enter an email address, like ada@example.com.";
  if (Object.keys(rejected).length > 0) {
    errors.value = rejected;
    return;
  }
  name.value = fullName;
  advance();
}

/** The invite form: every new, valid address joins the pending list and the field clears. */
function sendInvites(event: Event) {
  event.preventDefault();
  const formElement = event.currentTarget as HTMLFormElement;
  const field = String(new FormData(formElement).get("emails") ?? "");
  const addresses = [...new Set(field.split(",").map((address) => address.trim()))].filter(Boolean);
  if (addresses.length === 0) {
    emailsError.value = "Enter at least one email address.";
    return;
  }
  const invalid = addresses.find((address) => !EMAIL.test(address));
  if (invalid !== undefined) {
    emailsError.value = `${invalid} is not an email address.`;
    return;
  }
  emailsError.value = undefined;
  invites.value = [
    ...invites.value,
    ...addresses
      .filter((address) => !invites.value.some((invite) => invite.id === address))
      .map(inviteFor),
  ];
  formElement.reset();
}

function selectPlan(id: string) {
  plan.value = id;
  advance();
}

function removeInvite(id: string) {
  invites.value = invites.value.filter((invite) => invite.id !== id);
}

function pickPhoto(file: File) {
  avatarSrc.value = URL.createObjectURL(file);
}
</script>

<template>
  <div class="moderno-flow-onboarding">
    <Welcome
      v-if="step === 'welcome'"
      :name="name.split(/\s+/)[0] || undefined"
      :home-href="homeHref"
      :support-href="supportHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @continue="advance"
      @skip="finish"
      @navigate="navigate"
    />
    <ProfileSetup
      v-else-if="step === 'profile-setup'"
      :avatar-src="avatarSrc"
      :initials="initialsOf(name) || undefined"
      :errors="errors"
      :home-href="homeHref"
      :skip-href="urlFor('plan-select')"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @avatar-change="pickPhoto"
      @avatar-remove="avatarSrc = undefined"
      @submit="saveProfile"
      @cancel="go('welcome')"
      @navigate="navigate"
    />
    <PlanSelect
      v-else-if="step === 'plan-select'"
      :home-href="homeHref"
      :sales-href="salesHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @select="selectPlan"
      @navigate="navigate"
    />
    <InviteTeam
      v-else
      :invites="invites"
      :emails-error="emailsError"
      :home-href="homeHref"
      :skip-href="finishHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="sendInvites"
      @remove-invite="removeInvite"
      @continue="advance"
      @navigate="navigate"
    />
  </div>
</template>
