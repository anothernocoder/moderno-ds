import { useState } from "react";
import { Alert, Button, Skeleton } from "@moderno-ui/react";

const arrowPaths = ["M5 12h14", "m12 5 7 7-7 7"];
const copyPaths = [
  "M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z",
  "M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2",
];
const copiedPaths = ["M20 6 9 17l-5-5"];
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

export interface PromoProps {
  offer?: string;
  detail?: string;
  code?: string;
  actionLabel?: string;
  dismissible?: boolean;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onCopy?: (code: string) => void;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function Promo({
  offer = "20% off annual plans",
  detail = "Ends Sunday",
  code = "MONTHEND20",
  actionLabel = "Claim offer",
  dismissible = true,
  error,
  loading = false,
  disabled = false,
  onAction,
  onCopy,
  onDismiss,
  onRetry,
}: PromoProps) {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const showPromo = !error && !loading && !dismissed && Boolean(offer || detail);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    onCopy?.(code);
  }

  function dismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div className="@container moderno-block-promo text-foreground">
      {error ? (
        <Alert.Root variant="error">
          <Alert.Icon>
            <Icon paths={errorPaths} />
          </Alert.Icon>
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>The offer shows here once it loads.</Alert.Description>
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
            <Skeleton shape="text" className="w-1/2" />
            <Skeleton shape="rect" className="ms-auto h-8 w-24 shrink-0" />
            <Skeleton shape="rect" className="h-8 w-24 shrink-0" />
          </div>
          <span className="sr-only">Loading the offer…</span>
        </div>
      ) : null}

      {showPromo ? (
        <section
          aria-label="Promotion"
          className="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
        >
          <span aria-hidden="true" className="hidden @lg:block @lg:flex-1" />
          <div className="grid min-w-0 flex-1 gap-3 @md:flex @md:items-center @md:justify-between @md:gap-4 @lg:max-w-lg @lg:flex-initial">
            <p className="grid gap-1 text-body @sm:block @md:grid @lg:block">
              {offer ? <strong className="font-semibold">{offer}</strong> : null}
              {offer && detail ? (
                <span
                  aria-hidden="true"
                  className="hidden text-muted-foreground @sm:mx-2 @sm:inline @md:hidden @lg:inline"
                >
                  ·
                </span>
              ) : null}
              {detail ? <span className="text-muted-foreground">{detail}</span> : null}
            </p>
            {code || actionLabel ? (
              <div className="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-nowrap">
                {code ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    aria-label={`Copy code ${code}`}
                    onClick={copyCode}
                  >
                    <span className="font-mono">{code}</span>
                    <Icon paths={copied ? copiedPaths : copyPaths} />
                  </Button>
                ) : null}
                {actionLabel ? (
                  <Button type="button" size="sm" disabled={disabled} onClick={onAction}>
                    {actionLabel}
                    <Icon paths={arrowPaths} />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 @lg:flex-1 @lg:justify-end">
            {dismissible ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                aria-label="Dismiss promotion"
                onClick={dismiss}
              >
                <Icon paths={dismissPaths} />
              </Button>
            ) : null}
          </div>
          <span role="status" className="sr-only">
            {copied ? "Code copied" : ""}
          </span>
        </section>
      ) : null}
    </div>
  );
}
