<!--
  ReferralFlow — the example assembly for the `referral` flow: referral-invite
  → referral-share → referral-reward, and the navigation state between them.
  Copy it into your project with `moderno add referral-vue`; the three screens
  and the blocks they compose arrive with it, and every file is yours from that
  moment.

  This is the piece you are expected to rewrite. Every screen under it is
  presentational on purpose — props in, events out, no step, no router, no
  request — which leaves one question open: what comes after what. The design
  system answers it once, in a file whose whole job is to be replaced by yours.

  What it owns, and what the screens deliberately do not: `step`, `friends`
  (everyone invited so far, from the invite form or from the share screen's own
  invite field — the share screen lists them and the reward screen counts them)
  and `errors` (whatever the last invite form rejected; `go` drops it on every
  move). The reward numbers are not state: they are counted from `friends`, so
  they can never disagree with the list on the share screen.

  Navigation is link interception, not events: "Skip for now" on the share
  screen and "Invite more friends" on the reward screen are `href`s the
  mastheads draw, so they work on a page whose JavaScript never arrived. The
  assembly hands each screen the URLs it should point at (`hrefFor`) and
  catches the clicks on the way up, the way a client router does — modified and
  middle clicks are left to the browser, and an href that is not one of the
  flow's own is left alone.

  Forward moves: sending the invite form checks the addresses, adds them to
  `friends` and moves to the share screen; "Not now" moves there without
  sending. There is no server here, so the checks are the ones a form can make
  on its own: replace them with your request and keep the transitions.

  Where the flow ends: it does not. The reward screen is where a member comes
  back to, and "Invite more friends" returns to the share screen. Leaving is
  the wordmark, a plain link to `homeHref`.

  <ReferralFlow
    :href-for="(step) => `/referrals/${step}`"
    :initial-step="stepFromUrl"
    :initial-friends="friendsFromApi"
    @step-change="(step) => router.push(`/referrals/${step}`)"
    @invite="(emails) => api.invite(emails)"
  />
-->
<script setup lang="ts">
import { computed, ref } from "vue";
import ReferralInvite from "@/components/screens/ReferralInvite.vue";
import ReferralReward from "@/components/screens/ReferralReward.vue";
import ReferralShare from "@/components/screens/ReferralShare.vue";

/** One of the three screens the flow moves between, in the order it moves. */
type ReferralStep = "referral-invite" | "referral-share" | "referral-reward";

/** The flow, in order. Each one is what `hrefFor` is asked about. */
const REFERRAL_STEPS: readonly ReferralStep[] = [
  "referral-invite",
  "referral-share",
  "referral-reward",
];

/** A friend on the share screen's list. `status: "Joined"` counts as joined. */
interface ReferralFriend {
  id: string;
  name: string;
  email: string;
  status: string;
}

const props = withDefaults(
  defineProps<{
    /** Which screen the flow opens on — in a real app, whatever the route says. */
    initialStep?: ReferralStep;
    /** The friends invited before this visit, as your API returns them. */
    initialFriends?: ReferralFriend[];
    /** The reader's own referral link. */
    link?: string;
    /** What each side gets when a friend joins, like `"a free month"`. */
    reward?: string;
    /** The URL each step lives at. Give your router's paths; the default is a fragment per step. */
    hrefFor?: (step: ReferralStep) => string;
    /** Where the wordmark points, on every screen. */
    homeHref?: string;
    /** Where "How referrals work" points. */
    rulesHref?: string;
    /** Where the privacy links point, on every screen. */
    privacyHref?: string;
    /** Where the terms links point, on every screen. */
    termsHref?: string;
  }>(),
  {
    initialStep: "referral-invite",
    initialFriends: () => [],
    link: "https://example.com/r/ana-ruiz",
    reward: "a free month",
    hrefFor: undefined,
    homeHref: "#",
    rulesHref: "#",
    privacyHref: "#",
    termsHref: "#",
  },
);

const emit = defineEmits<{
  /** The flow moved: mirror it in the URL so a reload and the back button land where the reader is. */
  stepChange: [step: ReferralStep];
  /** Friends were invited, from either screen. Send the invitations here. */
  invite: [emails: string[]];
}>();

/** How many addresses one send takes — the number the invite screen promises. */
const MAX_INVITES = 10;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function urlFor(step: ReferralStep): string {
  return props.hrefFor ? props.hrefFor(step) : `#${step}`;
}

const step = ref<ReferralStep>(props.initialStep);
const friends = ref<ReferralFriend[]>([...props.initialFriends]);
const errors = ref<Record<string, string> | undefined>(undefined);

/** Nobody invited yet is "no activity", which each card draws as its empty state. */
function metric(count: number) {
  return friends.value.length === 0 ? null : { value: String(count) };
}

const stats = computed(() => {
  const joined = friends.value.filter((friend) => friend.status === "Joined").length;
  return [
    {
      id: "invited",
      label: "Friends invited",
      period: "All time",
      metric: metric(friends.value.length),
    },
    { id: "joined", label: "Friends joined", period: "All time", metric: metric(joined) },
    { id: "earned", label: "Months earned", period: "All time", metric: metric(joined) },
  ];
});

/** A move, and the one place the invite form's errors are dropped. */
function go(next: ReferralStep) {
  step.value = next;
  errors.value = undefined;
  emit("stepChange", next);
}

/** Adds the addresses nobody has invited yet, and reports them up. */
function invite(emails: string[]) {
  const known = new Set(friends.value.map((friend) => friend.email.toLowerCase()));
  const fresh = emails.filter((email) => !known.has(email.toLowerCase()));
  if (fresh.length === 0) return;
  friends.value = [
    ...friends.value,
    ...fresh.map((email) => ({ id: email, name: email.split("@")[0]!, email, status: "Invited" })),
  ];
  emit("invite", fresh);
}

/** The share screen's own invite field: one address at a time. */
function inviteOne(email: string) {
  invite([email]);
}

/** The reverse of `hrefFor`: which step, if any, an `href` in the markup stands for. */
function stepAt(href: string | null): ReferralStep | undefined {
  if (href === null) return undefined;
  return REFERRAL_STEPS.find((candidate) => urlFor(candidate) === href);
}

/**
 * A click on the way up from a screen. If it landed on a link this flow owns,
 * and it is the plain left click a router may take over, the flow navigates
 * itself; anything else — a modified click, a middle click, a link to the
 * rules or to the terms — is the browser's, untouched.
 */
function intercept(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as HTMLElement | null)?.closest("a");
  if (!anchor) return;
  const next = stepAt(anchor.getAttribute("href"));
  if (next === undefined) return;
  event.preventDefault();
  go(next);
}

/**
 * The invite form, read off the textarea the screen names `emails`: split on
 * commas and new lines, checked, then sent. Replace the checks with your
 * request; the move to the share screen is the part worth keeping.
 */
function submitInvites(event: Event) {
  event.preventDefault();
  const emails = String(new FormData(event.currentTarget as HTMLFormElement).get("emails") ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
  const invalid = emails.find((email) => !emailPattern.test(email));

  if (emails.length === 0) {
    errors.value = { emails: "Add at least one email address." };
    return;
  }
  if (invalid !== undefined) {
    errors.value = { emails: `${invalid} is not an email address.` };
    return;
  }
  if (emails.length > MAX_INVITES) {
    errors.value = { emails: `Up to ${MAX_INVITES} at a time. Send the rest next.` };
    return;
  }
  invite(emails);
  go("referral-share");
}
</script>

<template>
  <!--
    The interactive elements here are the anchors the screens draw, which
    already answer the keyboard on their own — Enter on a focused link fires
    this very click. The wrapper is a router's delegated listener, not a
    control, so it wants no role and no key handler of its own.
  -->
  <div class="moderno-flow-referral" @click="intercept">
    <ReferralInvite
      v-if="step === 'referral-invite'"
      :errors="errors"
      :home-href="homeHref"
      :rules-href="rulesHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
      @submit="submitInvites"
      @cancel="go('referral-share')"
    />
    <ReferralShare
      v-else-if="step === 'referral-share'"
      :link="link"
      :reward="reward"
      :friends="friends"
      :on-invite="inviteOne"
      :skip-href="urlFor('referral-reward')"
      :home-href="homeHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
    />
    <ReferralReward
      v-else
      :reward="reward"
      :stats="stats"
      :share-href="urlFor('referral-share')"
      :home-href="homeHref"
      :privacy-href="privacyHref"
      :terms-href="termsHref"
    />
  </div>
</template>
