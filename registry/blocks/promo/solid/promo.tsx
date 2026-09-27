import { createSignal, For, Show } from "solid-js";
import { Alert, Button, Skeleton } from "@moderno-ui/solid";

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

export function Promo(props: PromoProps) {
  const [copied, setCopied] = createSignal(false);
  const [dismissed, setDismissed] = createSignal(false);
  const offer = () => props.offer ?? "20% off annual plans";
  const detail = () => props.detail ?? "Ends Sunday";
  const code = () => props.code ?? "MONTHEND20";
  const actionLabel = () => props.actionLabel ?? "Claim offer";
  const dismissible = () => props.dismissible ?? true;
  const showPromo = () =>
    !props.error && !props.loading && !dismissed() && Boolean(offer() || detail());

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code());
    } catch {
      return;
    }
    setCopied(true);
    props.onCopy?.(code());
  }

  function dismiss() {
    setDismissed(true);
    props.onDismiss?.();
  }

  return (
    <div class="@container moderno-block-promo text-foreground">
      <Show when={props.error}>
        {(error) => (
          <Alert.Root variant="error">
            <Alert.Icon>
              <Icon paths={errorPaths} />
            </Alert.Icon>
            <Alert.Content>
              <Alert.Title>{error()}</Alert.Title>
              <Alert.Description>The offer shows here once it loads.</Alert.Description>
              <Alert.Action>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={props.disabled}
                  onClick={() => props.onRetry?.()}
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
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="rect" class="ms-auto h-8 w-24 shrink-0" />
            <Skeleton shape="rect" class="h-8 w-24 shrink-0" />
          </div>
          <span class="sr-only">Loading the offer…</span>
        </div>
      </Show>

      <Show when={showPromo()}>
        <section
          aria-label="Promotion"
          class="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
        >
          <span aria-hidden="true" class="hidden @lg:block @lg:flex-1" />
          <div class="grid min-w-0 flex-1 gap-3 @md:flex @md:items-center @md:justify-between @md:gap-4 @lg:max-w-lg @lg:flex-initial">
            <p class="grid gap-1 text-body @sm:block @md:grid @lg:block">
              <Show when={offer()}>
                <strong class="font-semibold">{offer()}</strong>
              </Show>
              <Show when={offer() && detail()}>
                <span
                  aria-hidden="true"
                  class="hidden text-muted-foreground @sm:mx-2 @sm:inline @md:hidden @lg:inline"
                >
                  ·
                </span>
              </Show>
              <Show when={detail()}>
                <span class="text-muted-foreground">{detail()}</span>
              </Show>
            </p>
            <Show when={code() || actionLabel()}>
              <div class="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-nowrap">
                <Show when={code()}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={props.disabled}
                    aria-label={`Copy code ${code()}`}
                    onClick={copyCode}
                  >
                    <span class="font-mono">{code()}</span>
                    <Icon paths={copied() ? copiedPaths : copyPaths} />
                  </Button>
                </Show>
                <Show when={actionLabel()}>
                  <Button
                    type="button"
                    size="sm"
                    disabled={props.disabled}
                    onClick={() => props.onAction?.()}
                  >
                    {actionLabel()}
                    <Icon paths={arrowPaths} />
                  </Button>
                </Show>
              </div>
            </Show>
          </div>
          <div class="flex shrink-0 @lg:flex-1 @lg:justify-end">
            <Show when={dismissible()}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={props.disabled}
                aria-label="Dismiss promotion"
                onClick={dismiss}
              >
                <Icon paths={dismissPaths} />
              </Button>
            </Show>
          </div>
          <span role="status" class="sr-only">
            {copied() ? "Code copied" : ""}
          </span>
        </section>
      </Show>
    </div>
  );
}
