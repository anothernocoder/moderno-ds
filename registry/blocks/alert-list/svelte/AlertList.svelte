<script lang="ts">
  import { Alert, Button, Card } from "@moderno-ui/svelte";

  type AlertListVariant = "info" | "success" | "warning" | "error";

  interface AlertListItem {
    id: string;
    variant: AlertListVariant;
    title: string;
    description?: string;
    meta?: string;
    actionLabel?: string;
  }

  interface Props {
    alerts?: AlertListItem[];
    heading?: string;
    description?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    ondismiss?: (id: string) => void;
    ondismissall?: () => void;
    onaction?: (id: string) => void;
    onretry?: () => void;
  }

  const sampleAlerts: AlertListItem[] = [
    {
      id: "payment",
      variant: "error",
      title: "Payment failed",
      description: "We could not charge the card ending 4242. Billing retries in two days.",
      meta: "2 min ago",
      actionLabel: "Update card",
    },
    {
      id: "storage",
      variant: "warning",
      title: "Storage almost full",
      description: "The workspace is using 92% of its plan's storage.",
      meta: "1 hr ago",
      actionLabel: "Manage storage",
    },
    {
      id: "sign-in",
      variant: "info",
      title: "New sign-in from Lisbon",
      description:
        "Chrome on macOS. Not you? End the session and change your password.",
      meta: "3 hrs ago",
      actionLabel: "Review session",
    },
    {
      id: "backup",
      variant: "success",
      title: "Backup finished",
      description: "Last night's backup completed in four minutes.",
      meta: "Yesterday",
    },
  ];

  const statusPath: Record<AlertListVariant, string> = {
    info: "M12 16v-4M12 8h.01",
    success: "m8 12 2.5 2.5L16 9",
    warning: "M12 8v4M12 16h.01",
    error: "m15 9-6 6M9 9l6 6",
  };

  let {
    alerts = sampleAlerts,
    heading = "Notifications",
    description = "What happened in your workspace while you were away.",
    error,
    loading = false,
    disabled = false,
    ondismiss,
    ondismissall,
    onaction,
    onretry,
  }: Props = $props();

  const inert = $derived(loading || disabled);
  const showList = $derived(!error && !loading && alerts.length > 0);
</script>

{#snippet statusIcon(variant: AlertListVariant)}
  <svg
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d={statusPath[variant]} />
  </svg>
{/snippet}

{#snippet dismissIcon()}
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
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
{/snippet}

<section class="@container moderno-block-alert-list text-foreground">
  <div class="grid gap-4">
    <div class="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
      <div class="grid gap-1">
        <h2 class="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
        {#if description}
          <p class="text-ui-md text-muted-foreground">{description}</p>
        {/if}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={inert || !showList}
        aria-busy={loading}
        onclick={ondismissall}
      >
        {#if loading}
          <span
            aria-hidden="true"
            class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          ></span>
          Refreshing
        {:else}
          Dismiss all
        {/if}
      </Button>
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Icon>{@render statusIcon("error")}</Alert.Icon>
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>
            Nothing was dismissed. Your notifications are still on the server.
          </Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" onclick={onretry}>Try again</Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {/if}

    {#if loading}
      <Card.Root>
        <Card.Content class="items-center justify-center text-center" role="status" aria-busy="true">
          <span
            aria-hidden="true"
            class="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          ></span>
          <p class="text-ui-md text-muted-foreground">Checking for new notifications…</p>
        </Card.Content>
      </Card.Root>
    {/if}

    {#if !error && !loading && alerts.length === 0}
      <Card.Root>
        <Card.Header class="items-center text-center">
          <Card.Title>You are all caught up</Card.Title>
          <Card.Description>
            New alerts about billing, security and your workspace appear here.
          </Card.Description>
        </Card.Header>
      </Card.Root>
    {/if}

    {#if showList}
      <ul class="grid gap-3">
        {#each alerts as item (item.id)}
          <li>
            <Alert.Root variant={item.variant} size="sm">
              <Alert.Icon>{@render statusIcon(item.variant)}</Alert.Icon>
              <Alert.Content>
                <div class="flex items-start justify-between gap-2">
                  <div class="grid min-w-0 flex-1 gap-1 @lg:flex @lg:items-baseline @lg:justify-between @lg:gap-4">
                    <Alert.Title>{item.title}</Alert.Title>
                    {#if item.meta}
                      <Alert.Description class="hidden text-ui-xs @sm:block">{item.meta}</Alert.Description>
                    {/if}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="shrink-0"
                    disabled={inert}
                    aria-label={`Dismiss — ${item.title}`}
                    onclick={() => ondismiss?.(item.id)}
                  >
                    {@render dismissIcon()}
                    <span class="hidden @md:inline">Dismiss</span>
                  </Button>
                </div>
                {#if item.description}
                  <Alert.Description class="line-clamp-2 @md:line-clamp-none">
                    {item.description}
                  </Alert.Description>
                {/if}
                {#if item.actionLabel}
                  <Alert.Action>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={inert}
                      onclick={() => onaction?.(item.id)}
                    >
                      {item.actionLabel}
                    </Button>
                  </Alert.Action>
                {/if}
              </Alert.Content>
            </Alert.Root>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
