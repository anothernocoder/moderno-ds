import { Show } from "solid-js";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/solid";

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

export function Hero(props: HeroProps) {
  const kicker = () => props.kicker ?? "Now in public beta";
  const title = () => props.title ?? "Run your business, not your books";
  const subtitle = () =>
    props.subtitle ??
    "Invoices, time tracking and receipts in one calm workspace, so the numbers are ready before you need them.";
  const primaryAction = () => props.primaryAction ?? "Start free trial";
  const secondaryAction = () => props.secondaryAction ?? "Book a demo";
  const hasActions = () => Boolean(primaryAction() || secondaryAction());

  return (
    <section class="@container moderno-block-hero text-foreground">
      <Show
        when={!props.loading}
        fallback={
          <div
            role="status"
            aria-busy="true"
            class="grid justify-items-center gap-6 px-4 py-12 @lg:py-24"
          >
            <Skeleton aria-hidden="true" shape="rect" class="h-6 w-36" />
            <div aria-hidden="true" class="grid w-full max-w-lg justify-items-center gap-3">
              <Skeleton shape="text" class="h-8 w-full @md:h-10" />
              <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
            </div>
            <div aria-hidden="true" class="grid w-full max-w-md justify-items-center gap-2">
              <Skeleton shape="text" class="w-full" />
              <Skeleton shape="text" class="w-3/4" />
            </div>
            <Skeleton aria-hidden="true" shape="rect" class="h-10 w-40" />
            <span class="sr-only">Loading…</span>
          </div>
        }
      >
        <div class="grid justify-items-center gap-6 px-4 py-12 text-center @lg:py-24">
          <Show when={kicker()}>
            <Badge variant="neutral">{kicker()}</Badge>
          </Show>

          <div class="grid max-w-lg gap-4">
            <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title()}</h1>
            <Show when={subtitle()}>
              <p class="mx-auto max-w-md text-body text-muted-foreground @md:text-body-lg">
                {subtitle()}
              </p>
            </Show>
          </div>

          <Show
            when={!props.error}
            fallback={
              <Alert.Root variant="error" class="w-full max-w-md text-start">
                <Alert.Content>
                  <Alert.Title>{props.error}</Alert.Title>
                  <Alert.Description>
                    The rest of the page still works. Try again in a moment.
                  </Alert.Description>
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
              <div class="mt-2 grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
                <Show when={primaryAction()}>
                  <Button
                    type="button"
                    size="lg"
                    disabled={props.disabled}
                    onClick={props.onPrimaryAction}
                  >
                    {primaryAction()}
                  </Button>
                </Show>
                <Show when={secondaryAction()}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
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
    </section>
  );
}
