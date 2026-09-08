import { Alert, Button, Card } from "@moderno-ui/react";

/**
 * AlertList — the notification centre: a stack of status alerts, newest first,
 * each dismissible on its own, under a heading that can clear the lot. Copy it
 * into your project with `moderno add alert-list-react` and edit it freely: the
 * copy, the sample notifications and the order are yours from that moment, and
 * every visual comes from the token contract, so a theme re-skins it without a
 * diff here.
 *
 * **Presentational.** The block owns no notifications and removes nothing: it
 * renders the `alerts` it is handed and reports the id of whatever the reader
 * dismissed or acted on. Keep the array in your own state and drop the item
 * there — that way an optimistic removal and an undo are both yours to decide.
 *
 * **Responsive to its container, not the viewport** (ADR-0005). The root
 * declares `@container` and the block makes one decision at each contract step:
 *
 * - `@sm` (`--container-sm`, 24rem) — the header stops stacking: the heading
 *   and the "Dismiss all" control share a row, which is where a list-wide
 *   action belongs once the two fit side by side.
 * - `@md` (`--container-md`, 36rem) — each alert's dismiss control grows its
 *   label. In a drawer it is a glyph and the message keeps the width; past the
 *   step there is room to say what the button does instead of implying it.
 * - `@lg` (`--container-lg`, 48rem) — each alert's timestamp leaves the stack
 *   under its title and moves to the trailing edge, on the title's baseline,
 *   which turns the list into a scannable timeline instead of a column of
 *   paragraphs.
 *
 * The same file is therefore right in a 320px notification drawer, in a panel
 * and on a full-width activity page, with no media query anywhere.
 *
 * **States.** *Default* is the list. *Empty* is a state of its own — the
 * collection loaded and there is nothing in it — so it renders the "all caught
 * up" card rather than an empty box; pass `alerts={[]}` to see it. *Loading*
 * replaces the list with a polite busy region (the spinner stops under
 * `prefers-reduced-motion`), because a stale list under a spinner invites the
 * reader to act on rows that are about to change. *Error* means the list itself
 * could not be loaded, so it renders one `Alert` with a retry rather than
 * pretending the collection is empty. *Disabled* keeps the alerts on screen and
 * makes every control inert — an audit or read-only view. *Hover* and
 * *focus-visible* are the primitives' own rules from `components.css`.
 *
 * Each row keeps `Alert`'s live-region role (`alert` for warning and error,
 * `status` otherwise), so an alert appended to a mounted list is announced;
 * a list rendered with the page is not, which is the behaviour a notification
 * centre wants.
 *
 * Icons are inline SVG stroking `currentColor`, not an icon package: the `icon`
 * part hands down the status hue, so a glyph follows the theme, and the block
 * stays installable without pulling an icon set into your dependencies.
 *
 * The timestamp is an `Alert.Description` too, sized down, rather than a muted
 * span of the block's own: secondary text on a status tint has to come from the
 * primitive, because the tint eats `--muted-foreground`'s AA margin and a block
 * may not invent a colour to make up the difference.
 * *
 * Class strings are written out in full rather than shared through a constant:
 * the docs compile the previews' Tailwind from `class` attributes, so a class
 * assembled in JS would render here and vanish in the preview.
 */
export type AlertListVariant = "info" | "success" | "warning" | "error";

export interface AlertListItem {
  /** Stable identity — what `onDismiss` and `onAction` report back. */
  id: string;
  /** Which status the row speaks in; picks the tint, the glyph and the role. */
  variant: AlertListVariant;
  /** The one line a reader scans. */
  title: string;
  /** The sentence under it, when the title is not the whole story. */
  description?: string;
  /** When it happened, already phrased for a reader ("2 min ago"). */
  meta?: string;
  /** Label of the row's own action; omit for an alert that is only news. */
  actionLabel?: string;
}

/**
 * The sample feed. A block has to be something concrete, so this is a real
 * workspace's morning: one of each status, most urgent first. Delete it and
 * pass your own `alerts` — or rewrite it in place, the file is yours.
 */
const sampleAlerts: AlertListItem[] = [
  {
    id: "payment",
    variant: "error",
    title: "Payment failed",
    description: "We could not charge the card ending 4242. Billing retries in two days.",
    meta: "2 min ago",
    actionLabel: "Update card",
  },
  {
    id: "storage",
    variant: "warning",
    title: "Storage almost full",
    description: "The workspace is using 92% of its plan's storage.",
    meta: "1 hr ago",
    actionLabel: "Manage storage",
  },
  {
    id: "sign-in",
    variant: "info",
    title: "New sign-in from Lisbon",
    description: "Chrome on macOS. If this was not you, end the session and change your password.",
    meta: "3 hrs ago",
    actionLabel: "Review session",
  },
  {
    id: "backup",
    variant: "success",
    title: "Backup finished",
    description: "Last night's backup completed in four minutes.",
    meta: "Yesterday",
  },
];

/** The glyph inside each status circle — the same four shapes the Alert docs use. */
const statusPath: Record<AlertListVariant, string> = {
  info: "M12 16v-4M12 8h.01",
  success: "m8 12 2.5 2.5L16 9",
  warning: "M12 8v4M12 16h.01",
  error: "m15 9-6 6M9 9l6 6",
};

function StatusIcon({ variant }: { variant: AlertListVariant }) {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d={statusPath[variant]} />
    </svg>
  );
}

function DismissIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export interface AlertListProps {
  /** The notifications to render, newest first. `[]` renders the empty state. */
  alerts?: AlertListItem[];
  /** The list itself could not be loaded; this message replaces it. */
  error?: string;
  /** The list is being loaded or refreshed: a busy region stands in for it. */
  loading?: boolean;
  /** Read-only: the alerts stay on screen and every control is inert. */
  disabled?: boolean;
  /** A row's dismiss control; you remove the item from your own state. */
  onDismiss?: (id: string) => void;
  /** Clear the whole list. */
  onDismissAll?: () => void;
  /** A row's own action (`actionLabel`), reported with that row's id. */
  onAction?: (id: string) => void;
  /** Retry after `error`. */
  onRetry?: () => void;
}

export function AlertList({
  alerts = sampleAlerts,
  error,
  loading = false,
  disabled = false,
  onDismiss,
  onDismissAll,
  onAction,
  onRetry,
}: AlertListProps) {
  const inert = loading || disabled;
  const showList = !error && !loading && alerts.length > 0;

  return (
    <section className="@container moderno-block-alert-list text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold @md:text-xl">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              What happened in your workspace while you were away.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={inert || !showList}
            aria-busy={loading}
            onClick={onDismissAll}
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                />
                Refreshing
              </>
            ) : (
              "Dismiss all"
            )}
          </Button>
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Icon>
              <StatusIcon variant="error" />
            </Alert.Icon>
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                Nothing was dismissed. Your notifications are still on the server.
              </Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        {loading ? (
          <Card.Root>
            <Card.Content
              className="items-center justify-center text-center"
              role="status"
              aria-busy="true"
            >
              <span
                aria-hidden="true"
                className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              />
              <p className="text-sm text-muted-foreground">Checking for new notifications…</p>
            </Card.Content>
          </Card.Root>
        ) : null}

        {!error && !loading && alerts.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>You are all caught up</Card.Title>
              <Card.Description>
                New alerts about billing, security and your workspace appear here.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showList ? (
          <ul className="grid gap-3">
            {alerts.map((item) => (
              <li key={item.id}>
                <Alert.Root variant={item.variant} size="sm">
                  <Alert.Icon>
                    <StatusIcon variant={item.variant} />
                  </Alert.Icon>
                  <Alert.Content>
                    <div className="grid gap-1 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
                      <Alert.Title>{item.title}</Alert.Title>
                      {item.meta ? (
                        <Alert.Description className="text-xs">{item.meta}</Alert.Description>
                      ) : null}
                    </div>
                    {item.description ? (
                      <Alert.Description>{item.description}</Alert.Description>
                    ) : null}
                    {item.actionLabel ? (
                      <Alert.Action>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={inert}
                          onClick={() => onAction?.(item.id)}
                        >
                          {item.actionLabel}
                        </Button>
                      </Alert.Action>
                    ) : null}
                  </Alert.Content>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    disabled={inert}
                    aria-label={`Dismiss — ${item.title}`}
                    onClick={() => onDismiss?.(item.id)}
                  >
                    <DismissIcon />
                    <span className="hidden @md:inline">Dismiss</span>
                  </Button>
                </Alert.Root>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
