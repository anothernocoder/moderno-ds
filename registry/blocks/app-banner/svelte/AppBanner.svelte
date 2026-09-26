<script lang="ts">
  import { Alert, Button, Skeleton } from "@moderno-ui/svelte";

  type AppBannerKind = "impersonation" | "trial" | "incident";

  interface AppBannerItem {
    id: string;
    kind: AppBannerKind;
    title: string;
    description?: string;
    actionLabel?: string;
    dismissible?: boolean;
  }

  interface Props {
    banners?: AppBannerItem[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: (id: string) => void;
    ondismiss?: (id: string) => void;
    onretry?: () => void;
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

  let {
    banners = sampleBanners,
    error,
    loading = false,
    disabled = false,
    onaction,
    ondismiss,
    onretry,
  }: Props = $props();

  const showBanners = $derived(!error && !loading && banners.length > 0);
</script>

{#snippet icon(paths: string[])}
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
    {#each paths as d (d)}
      <path {d} />
    {/each}
  </svg>
{/snippet}

<div class="@container moderno-block-app-banner text-foreground">
  {#if error}
    <Alert.Root variant="error">
      <Alert.Icon>{@render icon(kindIcon.incident)}</Alert.Icon>
      <Alert.Content>
        <Alert.Title>{error}</Alert.Title>
        <Alert.Description>Announcements for your workspace show here once they load.</Alert.Description>
        <Alert.Action>
          <Button type="button" variant="outline" size="sm" onclick={onretry}>Try again</Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
  {/if}

  {#if loading}
    <div role="status" aria-busy="true">
      <div aria-hidden="true" class="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <Skeleton shape="circle" class="size-5 shrink-0" />
        <div class="grid flex-1 gap-2">
          <Skeleton shape="text" class="w-1/3" />
          <Skeleton shape="text" class="w-2/3" />
        </div>
        <Skeleton shape="rect" class="h-8 w-20 shrink-0" />
      </div>
      <span class="sr-only">Loading announcements…</span>
    </div>
  {/if}

  {#if showBanners}
    <ul class="grid gap-2">
      {#each banners as banner (banner.id)}
        <li>
          <Alert.Root variant={kindVariant[banner.kind]}>
            <Alert.Icon>{@render icon(kindIcon[banner.kind])}</Alert.Icon>
            <Alert.Content>
              <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
                <div class="grid min-w-0 gap-1 @md:block">
                  <Alert.Title class="@md:inline">{banner.title}</Alert.Title>
                  {#if banner.description}
                    <Alert.Description class="@md:ms-2 @md:inline">{banner.description}</Alert.Description>
                  {/if}
                </div>
                {#if banner.actionLabel || banner.dismissible}
                  <div class="flex shrink-0 items-center gap-2">
                    {#if banner.actionLabel}
                      <Button
                        type="button"
                        variant={kindAction[banner.kind]}
                        size="sm"
                        {disabled}
                        onclick={() => onaction?.(banner.id)}
                      >
                        {banner.actionLabel}
                      </Button>
                    {/if}
                    {#if banner.dismissible}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        {disabled}
                        aria-label={`Dismiss — ${banner.title}`}
                        onclick={() => ondismiss?.(banner.id)}
                      >
                        {@render icon(dismissPath)}
                        <span class="hidden @lg:inline">Dismiss</span>
                      </Button>
                    {/if}
                  </div>
                {/if}
              </div>
            </Alert.Content>
          </Alert.Root>
        </li>
      {/each}
    </ul>
  {/if}
</div>
