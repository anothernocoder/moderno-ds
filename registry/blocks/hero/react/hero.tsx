import { Alert, Badge, Button, Skeleton } from "@moderno-ui/react";

export interface HeroProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  primaryAction?: string;
  secondaryAction?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onRetry?: () => void;
}

export function Hero({
  kicker = "Now in public beta",
  title = "Run your business, not your books",
  subtitle = "Invoices, time tracking and receipts in one calm workspace, so the numbers are ready before you need them.",
  primaryAction = "Start free trial",
  secondaryAction = "Book a demo",
  error,
  loading = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  onRetry,
}: HeroProps) {
  const hasActions = Boolean(primaryAction || secondaryAction);

  return (
    <section className="@container moderno-block-hero text-foreground">
      {loading ? (
        <div
          role="status"
          aria-busy="true"
          className="grid justify-items-center gap-6 px-4 py-12 @lg:py-24"
        >
          <Skeleton aria-hidden="true" shape="rect" className="h-6 w-36" />
          <div aria-hidden="true" className="grid w-full max-w-lg justify-items-center gap-3">
            <Skeleton shape="text" className="h-8 w-full @md:h-10" />
            <Skeleton shape="text" className="h-8 w-2/3 @md:h-10" />
          </div>
          <div aria-hidden="true" className="grid w-full max-w-md justify-items-center gap-2">
            <Skeleton shape="text" className="w-full" />
            <Skeleton shape="text" className="w-3/4" />
          </div>
          <Skeleton aria-hidden="true" shape="rect" className="h-10 w-40" />
          <span className="sr-only">Loading…</span>
        </div>
      ) : (
        <div className="grid justify-items-center gap-6 px-4 py-12 text-center @lg:py-24">
          {kicker ? <Badge variant="neutral">{kicker}</Badge> : null}

          <div className="grid max-w-lg gap-4">
            <h1 className="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
            {subtitle ? (
              <p className="mx-auto max-w-md text-body text-muted-foreground @md:text-body-lg">
                {subtitle}
              </p>
            ) : null}
          </div>

          {error ? (
            <Alert.Root variant="error" className="w-full max-w-md text-start">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
                <Alert.Description>
                  The rest of the page still works. Try again in a moment.
                </Alert.Description>
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
          ) : hasActions ? (
            <div className="mt-2 grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
              {primaryAction ? (
                <Button type="button" size="lg" disabled={disabled} onClick={onPrimaryAction}>
                  {primaryAction}
                </Button>
              ) : null}
              {secondaryAction ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={disabled}
                  onClick={onSecondaryAction}
                >
                  {secondaryAction}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
