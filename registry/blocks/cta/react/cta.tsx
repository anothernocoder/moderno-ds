import { Alert, Button, Skeleton } from "@moderno-ui/react";

export interface CtaProps {
  title?: string;
  description?: string;
  primaryAction?: string;
  secondaryAction?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onRetry?: () => void;
}

export function Cta({
  title = "Close the month in minutes, not days",
  description = "Bring invoices, receipts and bank feeds into one calm workspace. Free for 30 days.",
  primaryAction = "Start free trial",
  secondaryAction = "Talk to sales",
  error,
  loading = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  onRetry,
}: CtaProps) {
  const hasActions = Boolean(primaryAction || secondaryAction);

  return (
    <section className="@container moderno-block-cta">
      <div className="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
        {loading ? (
          <div
            role="status"
            aria-busy="true"
            className="grid justify-items-center gap-6 @lg:flex @lg:items-center @lg:justify-between @lg:gap-10"
          >
            <div
              aria-hidden="true"
              className="grid w-full max-w-md justify-items-center gap-3 @lg:justify-items-start"
            >
              <Skeleton shape="text" className="h-7 w-3/4 @md:h-8" />
              <Skeleton shape="text" className="w-full" />
            </div>
            <div aria-hidden="true" className="flex gap-3 @lg:shrink-0">
              <Skeleton shape="rect" className="h-10 w-32" />
              <Skeleton shape="rect" className="h-10 w-28" />
            </div>
            <span className="sr-only">Loading…</span>
          </div>
        ) : (
          <div className="grid justify-items-center gap-6 text-center @lg:flex @lg:items-center @lg:justify-between @lg:gap-10 @lg:text-start">
            <div className="grid max-w-md gap-2">
              <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{title}</h2>
              {description ? (
                <p className="text-body text-pretty text-muted-foreground">{description}</p>
              ) : null}
            </div>

            {error ? (
              <Alert.Root variant="error" className="w-full max-w-md text-start @lg:max-w-sm">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>The rest of the page still works.</Alert.Description>
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
              <div className="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center @lg:shrink-0">
                {primaryAction ? (
                  <Button type="button" disabled={disabled} onClick={onPrimaryAction}>
                    {primaryAction}
                  </Button>
                ) : null}
                {secondaryAction ? (
                  <Button
                    type="button"
                    variant="outline"
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
      </div>
    </section>
  );
}
