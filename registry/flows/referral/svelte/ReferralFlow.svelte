<!--
  ReferralFlow — the example assembly for the `referral` flow: referral-invite
  → referral-share → referral-reward, and the navigation state between them.
  Copy it into your project with `moderno add referral-svelte`; the three
  screens and the blocks they compose arrive with it, and every file is yours
  from that moment.

  This is the piece you are expected to rewrite. Every screen under it is
  presentational on purpose — props in, callbacks out, no step, no router, no
  request — which leaves one question open: what comes after what. The design
  system answers it once, in a file whose whole job is to be replaced by yours.

  What it owns, and what the screens deliberately do not: `step`, `friends`
  (everyone invited so far, from the invite form or from the share screen's own
  invite field — the share screen lists them and the reward screen counts them)
  and `errors` (whatever the last invite form rejected; `go` drops it on every
  move). The reward numbers are not state: they are counted from `friends`, so
  they can never disagree with the list on the share screen.

  Navigation is link interception, not callbacks: "Skip for now" on the share
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

  ```svelte
  <ReferralFlow
    hrefFor={(step) => `/referrals/${step}`}
    initialStep={stepFromUrl}
    initialFriends={friendsFromApi}
    onstepchange={(step) => goto(`/referrals/${step}`)}
    oninvite={(emails) => api.invite(emails)}
  />
  ```
-->
<script lang="ts">
  import { untrack } from "svelte";
  import ReferralInvite from "@/components/screens/ReferralInvite.svelte";
  import ReferralReward from "@/components/screens/ReferralReward.svelte";
  import ReferralShare from "@/components/screens/ReferralShare.svelte";

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

  interface Props {
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
    /** The flow moved: mirror it in the URL so a reload and the back button land where the reader is. */
    onstepchange?: (step: ReferralStep) => void;
    /** Friends were invited, from either screen. Send the invitations here. */
    oninvite?: (emails: string[]) => void;
    /** Where the wordmark points, on every screen. */
    homeHref?: string;
    /** Where "How referrals work" points. */
    rulesHref?: string;
    /** Where the privacy links point, on every screen. */
    privacyHref?: string;
    /** Where the terms links point, on every screen. */
    termsHref?: string;
  }

  let {
    initialStep = "referral-invite",
    initialFriends = [],
    link = "https://example.com/r/ana-ruiz",
    reward = "a free month",
    hrefFor = (step: ReferralStep) => `#${step}`,
    onstepchange,
    oninvite,
    homeHref = "#",
    rulesHref = "#",
    privacyHref = "#",
    termsHref = "#",
  }: Props = $props();

  /** How many addresses one send takes — the number the invite screen promises. */
  const MAX_INVITES = 10;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /*
    The initial* props seed the state once, on mount; after that the flow owns
    it. `untrack` says so, instead of leaving it to look like a forgotten
    dependency.
  */
  let step = $state<ReferralStep>(untrack(() => initialStep));
  let friends = $state<ReferralFriend[]>(untrack(() => [...initialFriends]));
  let errors = $state<Record<string, string> | undefined>(undefined);

  /** Nobody invited yet is "no activity", which each card draws as its empty state. */
  function metric(count: number) {
    return friends.length === 0 ? null : { value: String(count) };
  }

  const joined = $derived(friends.filter((friend) => friend.status === "Joined").length);
  const stats = $derived([
    { id: "invited", label: "Friends invited", period: "All time", metric: metric(friends.length) },
    { id: "joined", label: "Friends joined", period: "All time", metric: metric(joined) },
    { id: "earned", label: "Months earned", period: "All time", metric: metric(joined) },
  ]);

  /** A move, and the one place the invite form's errors are dropped. */
  function go(next: ReferralStep) {
    step = next;
    errors = undefined;
    onstepchange?.(next);
  }

  /**
   * Adds the addresses nobody has invited yet, and reports them up. An address
   * counts once whatever its case: one already on the list, or repeated in the
   * same send, is dropped.
   */
  function invite(emails: string[]) {
    const known = new Set(friends.map((friend) => friend.email.toLowerCase()));
    const fresh = emails.filter((email) => {
      const key = email.toLowerCase();
      if (known.has(key)) return false;
      known.add(key);
      return true;
    });
    if (fresh.length === 0) return;
    friends = [
      ...friends,
      ...fresh.map((email) => ({ id: email, name: email.split("@")[0]!, email, status: "Invited" })),
    ];
    oninvite?.(fresh);
  }

  /** The reverse of `hrefFor`: which step, if any, an `href` in the markup stands for. */
  function stepAt(href: string | null): ReferralStep | undefined {
    if (href === null) return undefined;
    return REFERRAL_STEPS.find((candidate) => hrefFor(candidate) === href);
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
  function submitInvites(event: SubmitEvent) {
    event.preventDefault();
    const emails = String(new FormData(event.currentTarget as HTMLFormElement).get("emails") ?? "")
      .split(/[\s,]+/)
      .filter(Boolean);
    const invalid = emails.find((email) => !emailPattern.test(email));

    if (emails.length === 0) {
      errors = { emails: "Add at least one email address." };
      return;
    }
    if (invalid !== undefined) {
      errors = { emails: `${invalid} is not an email address.` };
      return;
    }
    if (emails.length > MAX_INVITES) {
      errors = { emails: `Up to ${MAX_INVITES} at a time. Send the rest next.` };
      return;
    }
    invite(emails);
    go("referral-share");
  }
</script>

<!--
  The interactive elements here are the anchors the screens draw, which already
  answer the keyboard on their own — Enter on a focused link fires this very
  click. The wrapper is a router's delegated listener, not a control, so it
  wants no role and no key handler of its own.
-->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="moderno-flow-referral" onclick={intercept}>
  {#if step === "referral-invite"}
    <ReferralInvite
      {errors}
      onsubmit={submitInvites}
      oncancel={() => go("referral-share")}
      {homeHref}
      {rulesHref}
      {privacyHref}
      {termsHref}
    />
  {:else if step === "referral-share"}
    <ReferralShare
      {link}
      {reward}
      {friends}
      oninvite={(email: string) => invite([email])}
      skipHref={hrefFor("referral-reward")}
      {homeHref}
      {privacyHref}
      {termsHref}
    />
  {:else}
    <ReferralReward
      {reward}
      {stats}
      shareHref={hrefFor("referral-share")}
      {homeHref}
      {privacyHref}
      {termsHref}
    />
  {/if}
</div>
