<script lang="ts">
  import { Alert, Badge, Button, Skeleton } from "@moderno-ui/svelte";

  interface Props {
    badge?: string;
    title?: string;
    message?: string;
    actionLabel?: string;
    dismissible?: boolean;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    ondismiss?: () => void;
    onretry?: () => void;
  }

  const arrowPaths = ["M5 12h14", "m12 5 7 7-7 7"];
  const dismissPaths = ["M18 6 6 18M6 6l12 12"];
  const errorPaths = [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ];

  let {
    badge = "New",
    title = "Bank sync is live",
    message = "Connect your accounts and watch every transaction match its receipt.",
    actionLabel = "See how it works",
    dismissible = true,
    error,
    loading = false,
    disabled = false,
    onaction,
    ondismiss,
    onretry,
  }: Props = $props();

  let dismissed = $state(false);

  const showBanner = $derived(!error && !loading && !dismissed && Boolean(title || message));

  function dismiss() {
    dismissed = true;
    ondismiss?.();
  }
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

<div class="@container moderno-block-banner text-foreground">
  {#if error}
    <Alert.Root variant="error">
      <Alert.Icon>{@render icon(errorPaths)}</Alert.Icon>
      <Alert.Content>
        <Alert.Title>{error}</Alert.Title>
        <Alert.Description>The announcement shows here once it loads.</Alert.Description>
        <Alert.Action>
          <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>Try again</Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
  {/if}

  {#if loading}
    <div role="status" aria-busy="true">
      <div aria-hidden="true" class="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
        <Skeleton shape="rect" class="h-5 w-12 shrink-0" />
        <Skeleton shape="text" class="w-2/3" />
        <Skeleton shape="rect" class="ms-auto h-8 w-24 shrink-0" />
      </div>
      <span class="sr-only">Loading the announcement…</span>
    </div>
  {/if}

  {#if showBanner}
    <section
      aria-label="Announcement"
      class="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
    >
      <span aria-hidden="true" class="hidden @lg:block @lg:flex-1"></span>
      <div
        class="grid min-w-0 flex-1 gap-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4 @lg:max-w-md @lg:flex-initial"
      >
        <p class="grid justify-items-start gap-1 text-body @md:block">
          {#if badge}
            <Badge variant="outline" class="@md:me-2">{badge}</Badge>
          {/if}
          {#if title}
            <strong class="font-semibold">{title}</strong>
          {/if}
          {#if title && message}
            <span aria-hidden="true" class="hidden text-muted-foreground @md:mx-2 @md:inline">·</span>
          {/if}
          {#if message}
            <span class="text-muted-foreground">{message}</span>
          {/if}
        </p>
        {#if actionLabel}
          <Button type="button" size="sm" class="shrink-0 justify-self-start" {disabled} onclick={onaction}>
            {actionLabel}
            {@render icon(arrowPaths)}
          </Button>
        {/if}
      </div>
      <div class="flex shrink-0 @lg:flex-1 @lg:justify-end">
        {#if dismissible}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            {disabled}
            aria-label="Dismiss announcement"
            onclick={dismiss}
          >
            {@render icon(dismissPaths)}
          </Button>
        {/if}
      </div>
    </section>
  {/if}
</div>
