import { Show } from "solid-js";
import { Alert, Button, Skeleton } from "@moderno-ui/solid";

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

export function Cta(props: CtaProps) {
  const title = () => props.title ?? "Close the month in minutes, not days";
  const description = () =>
    props.description ??
    "Bring invoices, receipts and bank feeds into one calm workspace. Free for 30 days.";
  const primaryAction = () => props.primaryAction ?? "Start free trial";
  const secondaryAction = () => props.secondaryAction ?? "Talk to sales";
  const hasActions = () => Boolean(primaryAction() || secondaryAction());

  return (
    <section class="@container moderno-block-cta">
      <div class="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
        <Show
          when={!props.loading}
          fallback={
            <div
              role="status"
              aria-busy="true"
              class="grid justify-items-center gap-6 @lg:flex @lg:items-center @lg:justify-between @lg:gap-10"
            >
              <div
                aria-hidden="true"
                class="grid w-full max-w-md justify-items-center gap-3 @lg:justify-items-start"
              >
                <Skeleton shape="text" class="h-7 w-3/4 @md:h-8" />
                <Skeleton shape="text" class="w-full" />
              </div>
              <div aria-hidden="true" class="flex gap-3 @lg:shrink-0">
                <Skeleton shape="rect" class="h-10 w-32" />
                <Skeleton shape="rect" class="h-10 w-28" />
              </div>
              <span class="sr-only">Loading…</span>
            </div>
          }
        >
          <div class="grid justify-items-center gap-6 text-center @lg:flex @lg:items-center @lg:justify-between @lg:gap-10 @lg:text-start">
            <div class="grid max-w-md gap-2">
              <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{title()}</h2>
              <Show when={description()}>
                <p class="text-body text-pretty text-muted-foreground">{description()}</p>
              </Show>
            </div>

            <Show
              when={!props.error}
              fallback={
                <Alert.Root variant="error" class="w-full max-w-md text-start @lg:max-w-sm">
                  <Alert.Content>
                    <Alert.Title>{props.error}</Alert.Title>
                    <Alert.Description>The rest of the page still works.</Alert.Description>
                    <Alert.Action>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={props.disabled}
                        onClick={props.onRetry}
                      >
                        Try again
                      </Button>
                    </Alert.Action>
                  </Alert.Content>
                </Alert.Root>
              }
            >
              <Show when={hasActions()}>
                <div class="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center @lg:shrink-0">
                  <Show when={primaryAction()}>
                    <Button type="button" disabled={props.disabled} onClick={props.onPrimaryAction}>
                      {primaryAction()}
                    </Button>
                  </Show>
                  <Show when={secondaryAction()}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={props.disabled}
                      onClick={props.onSecondaryAction}
                    >
                      {secondaryAction()}
                    </Button>
                  </Show>
                </div>
              </Show>
            </Show>
          </div>
        </Show>
      </div>
    </section>
  );
}
