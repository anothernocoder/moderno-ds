import { createMemo, createSignal, Match, mergeProps, Switch } from "solid-js";
import { ReferralInvite } from "@/components/screens/referral-invite";
import { ReferralReward, type ReferralRewardStat } from "@/components/screens/referral-reward";
import { ReferralShare, type ReferralFriend } from "@/components/screens/referral-share";

/** One of the three screens the flow moves between, in the order it moves. */
export type ReferralStep = "referral-invite" | "referral-share" | "referral-reward";

/** The flow, in order. Each one is what `hrefFor` is asked about. */
export const REFERRAL_STEPS: readonly ReferralStep[] = [
  "referral-invite",
  "referral-share",
  "referral-reward",
];

export interface ReferralFlowProps {
  /** Which screen the flow opens on — in a real app, whatever the route says. */
  initialStep?: ReferralStep;
  /** The friends invited before this visit, as your API returns them. `status: "Joined"` counts as joined. */
  initialFriends?: ReferralFriend[];
  /** The reader's own referral link. */
  link?: string;
  /** What each side gets when a friend joins, like `"a free month"`. */
  reward?: string;
  /** The URL each step lives at. Give your router's paths; the default is a fragment per step. */
  hrefFor?: (step: ReferralStep) => string;
  /** The flow moved: mirror it in the URL so a reload and the back button land where the reader is. */
  onStepChange?: (step: ReferralStep) => void;
  /** Friends were invited, from either screen. Send the invitations here. */
  onInvite?: (emails: string[]) => void;
  /** Where the wordmark points, on every screen. */
  homeHref?: string;
  /** Where "How referrals work" points. */
  rulesHref?: string;
  /** Where the privacy links point, on every screen. */
  privacyHref?: string;
  /** Where the terms links point, on every screen. */
  termsHref?: string;
}

/** How many addresses one send takes — the number the invite screen promises. */
const MAX_INVITES = 10;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ReferralFlow — the example assembly for the `referral` flow: referral-invite
 * → referral-share → referral-reward, and the navigation state between them.
 * Copy it into your project with `moderno add referral-solid`; the three
 * screens and the blocks they compose arrive with it, and every file is yours
 * from that moment.
 *
 * **This is the piece you are expected to rewrite.** Every screen under it is
 * presentational on purpose — props in, callbacks out, no step, no router, no
 * request — which leaves one question open: what comes after what. The design
 * system answers it once, in a file whose whole job is to be replaced by yours.
 *
 * **What it owns**, and what the screens deliberately do not:
 *
 * - `step` — which of the three screens is on the route right now.
 * - `friends` — everyone invited so far, from the invite form or from the
 *   share screen's own invite field. The share screen lists them and the
 *   reward screen counts them, so both read the one list.
 * - `errors` — whatever the last invite form rejected. It belongs to the
 *   step that produced it, so `go` drops it on every move.
 *
 * The reward numbers are not state: they are counted from `friends` (invited,
 * joined, months earned), so they can never disagree with the list on the
 * share screen.
 *
 * **Navigation is link interception, not callbacks.** "Skip for now" on the
 * share screen and "Invite more friends" on the reward screen are `href`s the
 * mastheads draw, so they work on a page whose JavaScript never arrived. The
 * assembly hands each screen the URLs it should point at (`hrefFor`) and
 * catches the clicks on the way up, exactly as a client router does: modified
 * clicks and middle clicks are left to the browser, and an `href` that is not
 * one of the flow's own is left alone.
 *
 * ```tsx
 * <ReferralFlow
 *   hrefFor={(step) => `/referrals/${step}`}
 *   initialStep={stepFromUrl()}
 *   initialFriends={friendsFromApi()}
 *   onStepChange={(step) => navigate(`/referrals/${step}`)}
 *   onInvite={(emails) => api.invite(emails)}
 * />
 * ```
 *
 * **Forward moves.** Sending the invite form checks the addresses, adds them
 * to `friends` and moves to the share screen; "Not now" moves there without
 * sending. There is no server here, so the checks are the ones a form can
 * make on its own: replace them with your request and keep the transitions.
 *
 * **Where the flow ends.** It does not: the reward screen is where a member
 * comes back to, and "Invite more friends" returns to the share screen. Leaving
 * is the wordmark, which is a plain link to `homeHref`.
 */
export function ReferralFlow(props: ReferralFlowProps) {
  const merged = mergeProps(
    {
      initialStep: "referral-invite" as ReferralStep,
      initialFriends: [] as ReferralFriend[],
      link: "https://example.com/r/ana-ruiz",
      reward: "a free month",
      homeHref: "#",
      rulesHref: "#",
      privacyHref: "#",
      termsHref: "#",
    },
    props,
  );

  const [step, setStep] = createSignal<ReferralStep>(merged.initialStep);
  const [friends, setFriends] = createSignal<ReferralFriend[]>([...merged.initialFriends]);
  const [errors, setErrors] = createSignal<Record<string, string> | undefined>(undefined);

  const stats = createMemo<ReferralRewardStat[]>(() => {
    // Nobody invited yet is "no activity", which each card draws as its empty state.
    const metric = (count: number) => (friends().length === 0 ? null : { value: String(count) });
    const joined = friends().filter((friend) => friend.status === "Joined").length;
    return [
      {
        id: "invited",
        label: "Friends invited",
        period: "All time",
        metric: metric(friends().length),
      },
      { id: "joined", label: "Friends joined", period: "All time", metric: metric(joined) },
      { id: "earned", label: "Months earned", period: "All time", metric: metric(joined) },
    ];
  });

  const hrefFor = (target: ReferralStep): string =>
    merged.hrefFor ? merged.hrefFor(target) : `#${target}`;

  /** A move, and the one place the invite form's errors are dropped. */
  const go = (next: ReferralStep) => {
    setStep(next);
    setErrors(undefined);
    merged.onStepChange?.(next);
  };

  /**
   * Adds the addresses nobody has invited yet, and reports them up. An address
   * counts once whatever its case: one already on the list, or repeated in the
   * same send, is dropped.
   */
  const invite = (emails: string[]) => {
    const known = new Set(friends().map((friend) => friend.email.toLowerCase()));
    const fresh = emails.filter((email) => {
      const key = email.toLowerCase();
      if (known.has(key)) return false;
      known.add(key);
      return true;
    });
    if (fresh.length === 0) return;
    setFriends([
      ...friends(),
      ...fresh.map((email) => ({
        id: email,
        name: email.split("@")[0]!,
        email,
        status: "Invited",
      })),
    ]);
    merged.onInvite?.(fresh);
  };

  /** The reverse of `hrefFor`: which step, if any, an `href` in the markup stands for. */
  const stepAt = (href: string | null): ReferralStep | undefined => {
    if (href === null) return undefined;
    return REFERRAL_STEPS.find((candidate) => hrefFor(candidate) === href);
  };

  /**
   * A click on the way up from a screen. If it landed on a link this flow owns,
   * and it is the plain left click a router may take over, the flow navigates
   * itself; anything else — a modified click, a middle click, a link to the
   * rules or to the terms — is the browser's, untouched.
   */
  const intercept = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement | null)?.closest("a");
    if (!anchor) return;
    const next = stepAt(anchor.getAttribute("href"));
    if (next === undefined) return;
    event.preventDefault();
    go(next);
  };

  /**
   * The invite form, read off the textarea the screen names `emails`: split on
   * commas and new lines, checked, then sent. Replace the checks with your
   * request; the move to the share screen is the part worth keeping.
   */
  const submitInvites = (event: SubmitEvent) => {
    event.preventDefault();
    const emails = String(new FormData(event.currentTarget as HTMLFormElement).get("emails") ?? "")
      .split(/[\s,]+/)
      .filter(Boolean);
    const invalid = emails.find((email) => !emailPattern.test(email));

    if (emails.length === 0) {
      setErrors({ emails: "Add at least one email address." });
      return;
    }
    if (invalid !== undefined) {
      setErrors({ emails: `${invalid} is not an email address.` });
      return;
    }
    if (emails.length > MAX_INVITES) {
      setErrors({ emails: `Up to ${MAX_INVITES} at a time. Send the rest next.` });
      return;
    }
    invite(emails);
    go("referral-share");
  };

  return (
    /*
      The interactive elements here are the anchors the screens draw, which
      already answer the keyboard on their own — Enter on a focused link fires
      this very click. The wrapper is a router's delegated listener, not a
      control, so it wants no role and no key handler of its own.
    */
    <div class="moderno-flow-referral" onClick={intercept}>
      <Switch>
        <Match when={step() === "referral-invite"}>
          <ReferralInvite
            errors={errors()}
            onSubmit={submitInvites}
            onCancel={() => go("referral-share")}
            homeHref={merged.homeHref}
            rulesHref={merged.rulesHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "referral-share"}>
          <ReferralShare
            link={merged.link}
            reward={merged.reward}
            friends={friends()}
            onInvite={(email) => invite([email])}
            skipHref={hrefFor("referral-reward")}
            homeHref={merged.homeHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>

        <Match when={step() === "referral-reward"}>
          <ReferralReward
            reward={merged.reward}
            stats={stats()}
            shareHref={hrefFor("referral-share")}
            homeHref={merged.homeHref}
            privacyHref={merged.privacyHref}
            termsHref={merged.termsHref}
          />
        </Match>
      </Switch>
    </div>
  );
}
