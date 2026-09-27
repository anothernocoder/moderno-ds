import { For, Show } from "solid-js";
import { Alert, Button, Skeleton } from "@moderno-ui/solid";

export type AppBannerKind = "impersonation" | "trial" | "incident";

export interface AppBannerItem {
  id: string;
  kind: AppBannerKind;
  title: string;
  description?: string;
  actionLabel?: string;
  dismissible?: boolean;
}

const sampleBanners: AppBannerItem[] = [
  {
    id: "impersonation",
    kind: "impersonation",
    title: "Viewing as Jane Cooper",
    description: "You see what jane@acme.com sees. Every change you make is logged.",
    actionLabel: "Stop impersonating",
  },
  {
    id: "trial",
    kind: "trial",
    title: "12 days left in your trial",
    description: "Upgrade before 8 October to keep your projects and their history.",
    actionLabel: "Upgrade",
    dismissible: true,
  },
  {
    id: "incident",
    kind: "incident",
    title: "Degraded API performance",
    description: "Some requests take longer than usual. We are working on a fix.",
    actionLabel: "View status",
    dismissible: true,
  },
];

const kindVariant: Record<AppBannerKind, "warning" | "info" | "error"> = {
  impersonation: "warning",
  trial: "info",
  incident: "error",
};

const kindAction: Record<AppBannerKind, "primary" | "outline"> = {
  impersonation: "outline",
  trial: "primary",
  incident: "outline",
};

const kindIcon: Record<AppBannerKind, string[]> = {
  impersonation: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0"],
  trial: ["M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0", "M12 6v6l4 2"],
  incident: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
};

const dismissPath = ["M18 6 6 18M6 6l12 12"];

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

export interface AppBannerProps {
  banners?: AppBannerItem[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRetry?: () => void;
}

export function AppBanner(props: AppBannerProps) {
  const banners = () => props.banners ?? sampleBanners;
  const showBanners = () => !props.error && !props.loading && banners().length > 0;

  return (
    <div class="@container moderno-block-app-banner text-foreground">
      <Show when={props.error}>
        {(message) => (
          <Alert.Root variant="error">
            <Alert.Icon>
              <Icon paths={kindIcon.incident} />
            </Alert.Icon>
            <Alert.Content>
              <Alert.Title>{message()}</Alert.Title>
              <Alert.Description>
                Announcements for your workspace show here once they load.
              </Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
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
            class="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton shape="circle" class="size-5 shrink-0" />
            <div class="grid flex-1 gap-2">
              <Skeleton shape="text" class="w-1/3" />
              <Skeleton shape="text" class="w-2/3" />
            </div>
            <Skeleton shape="rect" class="h-8 w-20 shrink-0" />
          </div>
          <span class="sr-only">Loading announcements…</span>
        </div>
      </Show>

      <Show when={showBanners()}>
        <ul class="grid gap-2">
          <For each={banners()}>
            {(banner) => (
              <li>
                <Alert.Root variant={kindVariant[banner.kind]}>
                  <Alert.Icon>
                    <Icon paths={kindIcon[banner.kind]} />
                  </Alert.Icon>
                  <Alert.Content>
                    <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
                      <div class="grid min-w-0 gap-1 @md:block">
                        <Alert.Title class="@md:inline">{banner.title}</Alert.Title>
                        <Show when={banner.description}>
                          <Alert.Description class="@md:ms-2 @md:inline">
                            {banner.description}
                          </Alert.Description>
                        </Show>
                      </div>
                      <Show when={banner.actionLabel || banner.dismissible}>
                        <div class="flex shrink-0 items-center gap-2">
                          <Show when={banner.actionLabel}>
                            <Button
                              type="button"
                              variant={kindAction[banner.kind]}
                              size="sm"
                              disabled={props.disabled}
                              onClick={() => props.onAction?.(banner.id)}
                            >
                              {banner.actionLabel}
                            </Button>
                          </Show>
                          <Show when={banner.dismissible}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={props.disabled}
                              aria-label={`Dismiss — ${banner.title}`}
                              onClick={() => props.onDismiss?.(banner.id)}
                            >
                              <Icon paths={dismissPath} />
                              <span class="hidden @lg:inline">Dismiss</span>
                            </Button>
                          </Show>
                        </div>
                      </Show>
                    </div>
                  </Alert.Content>
                </Alert.Root>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}
