<!--
  OnboardingFlow — the example assembly for the `onboarding` flow: welcome →
  profile-setup → plan-select → invite-team, and the state between them. Copy it
  into your project with `moderno add onboarding-svelte`; the four screens and
  the blocks they compose arrive with it, and every file is yours from that
  moment.

  This is the piece you are expected to rewrite. Every screen under it is
  presentational — props in, callbacks out, no step, no request, no router — so
  the order of the screens, and what each one hands the next, live here.

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

  ```svelte
  <OnboardingFlow
    hrefFor={(step) => `/onboarding/${step}`}
    initialStep={stepFromUrl}
    onstepchange={(step) => goto(`/onboarding/${step}`)}
    oncomplete={(result) => saveAndGo(result, "/")}
  />
  ```

  Where the flow ends. `oncomplete` gets the name, the plan and the invites, and
  the flow returns to its first step. It paints no "all set" page: leaving is
  your router's job.

  Editing a pending invite is left to you: the list draws an Edit button, and
  what it opens depends on what an invite holds in your product.
-->
<script lang="ts">
  import { untrack, type ComponentProps } from "svelte";
  import InviteTeam from "@/components/screens/InviteTeam.svelte";
  import PlanSelect from "@/components/screens/PlanSelect.svelte";
  import ProfileSetup from "@/components/screens/ProfileSetup.svelte";
  import Welcome from "@/components/screens/Welcome.svelte";

  type OnboardingStep = "welcome" | "profile-setup" | "plan-select" | "invite-team";

  /** What the reader set up, handed to `oncomplete` when they leave the flow. */
  interface OnboardingResult {
    /** The full name saved on the profile, or the one the flow started with. */
    name: string;
    /** The `id` of the chosen plan; `undefined` when the reader skipped past it. */
    plan?: string;
    /** Every address invited, in the order they were sent. */
    invites: string[];
  }

  type Invite = NonNullable<ComponentProps<typeof InviteTeam>["invites"]>[number];

  /** The flow, in order. "Forward" always means the next entry here. */
  const ONBOARDING_STEPS: readonly OnboardingStep[] = [
    "welcome",
    "profile-setup",
    "plan-select",
    "invite-team",
  ];

  /** A pragmatic address check, the kind a form can make on its own; your server has the final word. */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  interface Props {
    /** Which screen the flow opens on — in a real app, whatever the route says. */
    initialStep?: OnboardingStep;
    /** The reader's full name, if sign-up already asked for it. Welcome greets them by the first word. */
    initialName?: string;
    /** The URL each step lives at. Give your router's paths; the default is a fragment per step. */
    hrefFor?: (step: OnboardingStep) => string;
    /** Where the app begins: what "Skip for now" on the last step points at. */
    finishHref?: string;
    /** The flow moved: mirror it in the URL so a reload and the back button land where the reader is. */
    onstepchange?: (step: OnboardingStep) => void;
    /** The reader is through — finished or skipped. Save the result and take them into the app. */
    oncomplete?: (result: OnboardingResult) => void;
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
  }

  let {
    initialStep = "welcome",
    initialName = "",
    hrefFor = (step: OnboardingStep) => `#${step}`,
    finishHref = "#",
    onstepchange,
    oncomplete,
    homeHref = "#",
    supportHref = "#",
    salesHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

  let step = $state<OnboardingStep>(untrack(() => initialStep));
  let name = $state(untrack(() => initialName));
  let avatarSrc = $state<string | undefined>(undefined);
  let plan = $state<string | undefined>(undefined);
  let invites = $state<Invite[]>([]);
  let errors = $state<Record<string, string> | undefined>(undefined);
  let emailsError = $state<string | undefined>(undefined);

  /** Each picked photo is an object URL; release it once it is replaced or the flow unmounts. */
  $effect(() => {
    const src = avatarSrc;
    if (src === undefined) return;
    return () => URL.revokeObjectURL(src);
  });

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
    step = next;
    errors = undefined;
    emailsError = undefined;
    onstepchange?.(next);
  }

  /** The flow's exit: what was set up goes up, and the reader goes wherever you send them. */
  function finish() {
    oncomplete?.({ name, plan, invites: invites.map((invite) => invite.id) });
    go("welcome");
  }

  /** One step forward, or out of the flow from the last one. */
  function advance() {
    const next = ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1];
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
  function saveProfile(event: SubmitEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const fullName = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const rejected: Record<string, string> = {};
    if (fullName === "") rejected.fullName = "Enter your name.";
    if (!EMAIL.test(email)) rejected.email = "Enter an email address, like ada@example.com.";
    if (Object.keys(rejected).length > 0) {
      errors = rejected;
      return;
    }
    name = fullName;
    advance();
  }

  /** The invite form: every new, valid address joins the pending list and the field clears. */
  function sendInvites(event: SubmitEvent) {
    event.preventDefault();
    const formElement = event.currentTarget as HTMLFormElement;
    const field = String(new FormData(formElement).get("emails") ?? "");
    const addresses = [...new Set(field.split(",").map((address) => address.trim()))].filter(
      Boolean,
    );
    if (addresses.length === 0) {
      emailsError = "Enter at least one email address.";
      return;
    }
    const invalid = addresses.find((address) => !EMAIL.test(address));
    if (invalid !== undefined) {
      emailsError = `${invalid} is not an email address.`;
      return;
    }
    emailsError = undefined;
    invites = [
      ...invites,
      ...addresses
        .filter((address) => !invites.some((invite) => invite.id === address))
        .map(inviteFor),
    ];
    formElement.reset();
  }

  function selectPlan(id: string) {
    plan = id;
    advance();
  }

  function removeInvite(id: string) {
    invites = invites.filter((invite) => invite.id !== id);
  }
</script>

<div class="moderno-flow-onboarding">
  {#if step === "welcome"}
    <Welcome
      name={name.split(/\s+/)[0] || undefined}
      oncontinue={advance}
      onskip={finish}
      onnavigate={navigate}
      {homeHref}
      {supportHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "profile-setup"}
    <ProfileSetup
      {avatarSrc}
      initials={initialsOf(name) || undefined}
      {errors}
      onavatarchange={(file) => (avatarSrc = URL.createObjectURL(file))}
      onavatarremove={() => (avatarSrc = undefined)}
      onsubmit={saveProfile}
      oncancel={() => go("welcome")}
      onnavigate={navigate}
      {homeHref}
      skipHref={hrefFor("plan-select")}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "plan-select"}
    <PlanSelect
      onselect={selectPlan}
      onnavigate={navigate}
      {homeHref}
      {salesHref}
      {privacyHref}
      {termsHref}
    />
  {:else}
    <InviteTeam
      {invites}
      {emailsError}
      onsubmit={sendInvites}
      onremoveinvite={removeInvite}
      oncontinue={advance}
      onnavigate={navigate}
      {homeHref}
      skipHref={finishHref}
      {privacyHref}
      {termsHref}
    />
  {/if}
</div>
