import { Alert, Button, Skeleton } from "@moderno-ui/react";

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

const dismissPath = ["M18 6 6 18M6 6l12 12"];

export interface AppBannerProps {
  banners?: AppBannerItem[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRetry?: () => void;
}

export function AppBanner({
  banners = sampleBanners,
  error,
  loading = false,
  disabled = false,
  onAction,
  onDismiss,
  onRetry,
}: AppBannerProps) {
  const showBanners = !error && !loading && banners.length > 0;

  return (
    <div className="@container moderno-block-app-banner text-foreground">
      {error ? (
        <Alert.Root variant="error">
          <Alert.Icon>
            <Icon paths={kindIcon.incident} />
          </Alert.Icon>
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>
              Announcements for your workspace show here once they load.
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
        <div role="status" aria-busy="true">
          <div
            aria-hidden="true"
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton shape="circle" className="size-5 shrink-0" />
            <div className="grid flex-1 gap-2">
              <Skeleton shape="text" className="w-1/3" />
              <Skeleton shape="text" className="w-2/3" />
            </div>
            <Skeleton shape="rect" className="h-8 w-20 shrink-0" />
          </div>
          <span className="sr-only">Loading announcements…</span>
        </div>
      ) : null}

      {showBanners ? (
        <ul className="grid gap-2">
          {banners.map((banner) => (
            <li key={banner.id}>
              <Alert.Root variant={kindVariant[banner.kind]}>
                <Alert.Icon>
                  <Icon paths={kindIcon[banner.kind]} />
                </Alert.Icon>
                <Alert.Content>
                  <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
                    <div className="grid min-w-0 gap-1 @md:block">
                      <Alert.Title className="@md:inline">{banner.title}</Alert.Title>
                      {banner.description ? (
                        <Alert.Description className="@md:ms-2 @md:inline">
                          {banner.description}
                        </Alert.Description>
                      ) : null}
                    </div>
                    {banner.actionLabel || banner.dismissible ? (
                      <div className="flex shrink-0 items-center gap-2">
                        {banner.actionLabel ? (
                          <Button
                            type="button"
                            variant={kindAction[banner.kind]}
                            size="sm"
                            disabled={disabled}
                            onClick={() => onAction?.(banner.id)}
                          >
                            {banner.actionLabel}
                          </Button>
                        ) : null}
                        {banner.dismissible ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            aria-label={`Dismiss — ${banner.title}`}
                            onClick={() => onDismiss?.(banner.id)}
                          >
                            <Icon paths={dismissPath} />
                            <span className="hidden @lg:inline">Dismiss</span>
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </Alert.Content>
              </Alert.Root>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
