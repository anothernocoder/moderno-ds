import { createSignal, For, Show } from "solid-js";
import { Alert, Badge, Button, Skeleton } from "@moderno-ui/solid";

const arrowPaths = ["M5 12h14", "m12 5 7 7-7 7"];
const dismissPaths = ["M18 6 6 18M6 6l12 12"];
const errorPaths = [
  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
  "M12 9v4",
  "M12 17h.01",
];

function Icon(props: { paths: string[] }) {
  return (
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <For each={props.paths}>{(d) => <path d={d} />}</For>
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

export function Banner(props: BannerProps) {
  const [dismissed, setDismissed] = createSignal(false);
  const badge = () => props.badge ?? "New";
  const title = () => props.title ?? "Bank sync is live";
  const message = () =>
    props.message ?? "Connect your accounts and watch every transaction match its receipt.";
  const actionLabel = () => props.actionLabel ?? "See how it works";
  const dismissible = () => props.dismissible ?? true;
  const showBanner = () =>
    !props.error && !props.loading && !dismissed() && Boolean(title() || message());

  function dismiss() {
    setDismissed(true);
    props.onDismiss?.();
  }

  return (
    <div class="@container moderno-block-banner text-foreground">
      <Show when={props.error}>
        {(error) => (
          <Alert.Root variant="error">
            <Alert.Icon>
              <Icon paths={errorPaths} />
            </Alert.Icon>
            <Alert.Content>
              <Alert.Title>{error()}</Alert.Title>
              <Alert.Description>The announcement shows here once it loads.</Alert.Description>
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
        )}
      </Show>

      <Show when={props.loading}>
        <div role="status" aria-busy="true">
          <div
            aria-hidden="true"
            class="flex items-center gap-3 border-b border-border bg-muted px-4 py-3"
          >
            <Skeleton shape="rect" class="h-5 w-12 shrink-0" />
            <Skeleton shape="text" class="w-2/3" />
            <Skeleton shape="rect" class="ms-auto h-8 w-24 shrink-0" />
          </div>
          <span class="sr-only">Loading the announcement…</span>
        </div>
      </Show>

      <Show when={showBanner()}>
        <section
          aria-label="Announcement"
          class="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
        >
          <span aria-hidden="true" class="hidden @lg:block @lg:flex-1" />
          <div class="grid min-w-0 flex-1 gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @lg:max-w-md @lg:flex-initial">
            <p class="grid justify-items-start gap-1 text-body @md:block">
              <Show when={badge()}>
                <Badge variant="outline" class="@md:me-2">
                  {badge()}
                </Badge>
              </Show>
              <Show when={title()}>
                <strong class="font-semibold">{title()}</strong>
              </Show>
              <Show when={title() && message()}>
                <span aria-hidden="true" class="hidden text-muted-foreground @md:mx-2 @md:inline">
                  ·
                </span>
              </Show>
              <Show when={message()}>
                <span class="text-muted-foreground">{message()}</span>
              </Show>
            </p>
            <Show when={actionLabel()}>
              <Button
                type="button"
                size="sm"
                class="shrink-0 justify-self-start"
                disabled={props.disabled}
                onClick={() => props.onAction?.()}
              >
                {actionLabel()}
                <Icon paths={arrowPaths} />
              </Button>
            </Show>
          </div>
          <div class="flex shrink-0 @lg:flex-1 @lg:justify-end">
            <Show when={dismissible()}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={props.disabled}
                aria-label="Dismiss announcement"
                onClick={dismiss}
              >
                <Icon paths={dismissPaths} />
              </Button>
            </Show>
          </div>
        </section>
      </Show>
    </div>
  );
}
