import { useState } from "react";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/react";

const arrowPaths = ["M5 12h14", "m12 5 7 7-7 7"];
const dismissPaths = ["M18 6 6 18M6 6l12 12"];
const errorPaths = [
  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
  "M12 9v4",
  "M12 17h.01",
];

function Icon({ paths }: { paths: string[] }) {
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
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export interface BannerProps {
  badge?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  dismissible?: boolean;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function Banner({
  badge = "New",
  title = "Bank sync is live",
  message = "Connect your accounts and watch every transaction match its receipt.",
  actionLabel = "See how it works",
  dismissible = true,
  error,
  loading = false,
  disabled = false,
  onAction,
  onDismiss,
  onRetry,
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const showBanner = !error && !loading && !dismissed && Boolean(title || message);

  function dismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div className="@container moderno-block-banner text-foreground">
      {error ? (
        <Alert.Root variant="error">
          <Alert.Icon>
            <Icon paths={errorPaths} />
          </Alert.Icon>
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>The announcement shows here once it loads.</Alert.Description>
            <Alert.Action>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={onRetry}
              >
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
      ) : null}

      {loading ? (
        <div role="status" aria-busy="true">
          <div
            aria-hidden="true"
            className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3"
          >
            <Skeleton shape="rect" className="h-5 w-12 shrink-0" />
            <Skeleton shape="text" className="w-2/3" />
            <Skeleton shape="rect" className="ms-auto h-8 w-24 shrink-0" />
          </div>
          <span className="sr-only">Loading the announcement…</span>
        </div>
      ) : null}

      {showBanner ? (
        <section
          aria-label="Announcement"
          className="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
        >
          <span aria-hidden="true" className="hidden @lg:block @lg:flex-1" />
          <div className="grid min-w-0 flex-1 gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @lg:max-w-md @lg:flex-initial">
            <p className="grid justify-items-start gap-1 text-body @md:block">
              {badge ? (
                <Badge variant="outline" className="@md:me-2">
                  {badge}
                </Badge>
              ) : null}
              {title ? <strong className="font-semibold">{title}</strong> : null}
              {title && message ? (
                <span
                  aria-hidden="true"
                  className="hidden text-muted-foreground @md:mx-2 @md:inline"
                >
                  ·
                </span>
              ) : null}
              {message ? <span className="text-muted-foreground">{message}</span> : null}
            </p>
            {actionLabel ? (
              <Button
                type="button"
                size="sm"
                className="shrink-0 justify-self-start"
                disabled={disabled}
                onClick={onAction}
              >
                {actionLabel}
                <Icon paths={arrowPaths} />
              </Button>
            ) : null}
          </div>
          <div className="flex shrink-0 @lg:flex-1 @lg:justify-end">
            {dismissible ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                aria-label="Dismiss announcement"
                onClick={dismiss}
              >
                <Icon paths={dismissPaths} />
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
