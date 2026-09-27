import { For } from "solid-js";
import { KpiCard, type KpiCardMetric } from "@/components/blocks/kpi-card";

/**
 * ReferralReward — the full-viewport screen where a member sees what their
 * referrals have earned them: one KPI card per number (friends invited,
 * friends joined, rewards earned), each with its change and its trend. Copy it
 * into your project with `moderno add referral-reward-solid`; the block it
 * composes arrives with it, and every file is yours from that moment.
 *
 * **Presentational.** The screen owns the viewport and nothing else: no
 * request, no router. It renders the numbers and states it is handed and
 * reports what the reader did — `onRetry` inside the error, and `onNavigate`
 * for every link it draws itself. Counting the rewards stays in the page that
 * mounts this.
 *
 * Links carry an `href` and call `onNavigate(destination, event)` on top: a
 * client router can `preventDefault()` — after reading `metaKey` to leave a
 * ctrl/cmd-click to the browser — while the markup still works without
 * JavaScript.
 *
 * The root is a `<div>`, not a `<main>`: most app shells already provide the
 * `main` landmark. If your route has none, make this element your `<main>`.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). Full-viewport
 * is a *height* — `min-h-dvh` — and every width decision is read off the
 * screen's own `@container`:
 *
 * - `@sm` (`--container-sm`, 24rem) — the masthead stops stacking: the
 *   wordmark shares a row with "Invite more friends".
 * - `@md` (`--container-md`, 36rem) — the title grows and the footer stops
 *   stacking.
 * - `@lg` (`--container-lg`, 48rem) — the KPI cards sit side by side.
 *
 * Each KPI card keeps its own `@sm`/`@md`/`@lg` steps.
 *
 * **States.** `error`, `loading` and `disabled` go to every card. A stat whose
 * `metric` is `null` shows the card's empty state: no activity yet.
 *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type ReferralRewardDestination = "home" | "share" | "privacy" | "terms";

export interface ReferralRewardStat {
  id: string;
  /** The card's title, like `"Friends joined"`. */
  label: string;
  /** Shown under the label, like `"All time"`. */
  period?: string;
  /** The number, its change and its trend. `null` shows the card's empty state. */
  metric: KpiCardMetric | null;
}

const sampleStats: ReferralRewardStat[] = [
  {
    id: "invited",
    label: "Friends invited",
    period: "All time",
    metric: {
      value: "12",
      delta: "+4",
      tone: "positive",
      caption: "this month",
      trend: [1, 2, 2, 3, 4, 5, 6, 8, 8, 10, 11, 12],
    },
  },
  {
    id: "joined",
    label: "Friends joined",
    period: "All time",
    metric: {
      value: "5",
      delta: "+2",
      tone: "positive",
      caption: "this month",
      trend: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5],
    },
  },
  {
    id: "earned",
    label: "Months earned",
    period: "All time",
    metric: {
      value: "5",
      delta: "+2",
      tone: "positive",
      caption: "this month",
      trend: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5],
    },
  },
];

export interface ReferralRewardProps {
  /** What the reader gets for each friend who joins, like `"a free month"`. */
  reward?: string;
  /** One KPI card each. Defaults to a sample: friends invited, friends joined, months earned. */
  stats?: ReferralRewardStat[];
  /** The rewards could not be loaded. Every card shows the message and a retry. */
  error?: string;
  /** The rewards are loading: every card shows placeholders. */
  loading?: boolean;
  /** Every control is shown but inert. */
  disabled?: boolean;
  /** "Try again" was pressed, inside the error. */
  onRetry?: () => void;
  /**
   * A link the screen draws itself was activated, with the click event that
   * did it: `preventDefault()` on it to route without a document navigation,
   * and read `metaKey` / `ctrlKey` first to leave a new-tab click alone.
   */
  onNavigate?: (destination: ReferralRewardDestination, event: MouseEvent) => void;
  /** Where the wordmark points. */
  homeHref?: string;
  /** Where "Invite more friends" points: the referral share screen. */
  shareHref?: string;
  /** Where the privacy link points. */
  privacyHref?: string;
  /** Where the terms link points. */
  termsHref?: string;
}

export function ReferralReward(props: ReferralRewardProps) {
  const reward = () => props.reward ?? "a free month";
  const stats = () => props.stats ?? sampleStats;

  return (
    <div class="@container moderno-screen-referral-reward min-h-dvh bg-background text-foreground">
      <div class="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-8 p-6">
        <header class="grid gap-2 @sm:flex @sm:items-center @sm:justify-between">
          <a
            class="rounded-sm text-body font-semibold tracking-tight underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={props.homeHref ?? "#"}
            onClick={(event) => props.onNavigate?.("home", event)}
          >
            Moderno
          </a>
          <a
            class="rounded-sm text-ui-md font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={props.shareHref ?? "#"}
            onClick={(event) => props.onNavigate?.("share", event)}
          >
            Invite more friends
          </a>
        </header>

        <div class="mx-auto grid w-full max-w-4xl content-start gap-8">
          <div class="grid gap-1">
            <h1 class="text-heading-sm font-semibold tracking-tight @md:text-heading">
              Your rewards
            </h1>
            <p class="text-ui-md text-muted-foreground">
              You get {reward()} for every friend who joins with your link.
            </p>
          </div>

          <section class="grid gap-4">
            <h2 class="text-body-lg font-semibold @md:text-heading-sm">Reward status</h2>
            <div class="grid gap-4 @lg:grid-cols-3">
              <For each={stats()}>
                {(stat) => (
                  <KpiCard
                    label={stat.label}
                    period={stat.period ?? ""}
                    metric={stat.metric}
                    actionLabel=""
                    error={props.error}
                    loading={props.loading}
                    disabled={props.disabled}
                    onRetry={props.onRetry}
                  />
                )}
              </For>
            </div>
          </section>
        </div>

        <footer class="grid gap-2 text-ui-md text-muted-foreground @md:flex @md:items-center @md:justify-between">
          <p>© Moderno</p>
          <nav class="flex gap-4" aria-label="Legal">
            <a
              class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.privacyHref ?? "#"}
              onClick={(event) => props.onNavigate?.("privacy", event)}
            >
              Privacy
            </a>
            <a
              class="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={props.termsHref ?? "#"}
              onClick={(event) => props.onNavigate?.("terms", event)}
            >
              Terms
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
