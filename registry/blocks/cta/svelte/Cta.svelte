<script lang="ts">
  import { Alert, Button, Skeleton } from "@moderno-ui/svelte";

  interface Props {
    title?: string;
    description?: string;
    primaryAction?: string;
    secondaryAction?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onprimaryaction?: () => void;
    onsecondaryaction?: () => void;
    onretry?: () => void;
  }

  let {
    title = "Close the month in minutes, not days",
    description = "Bring invoices, receipts and bank feeds into one calm workspace. Free for 30 days.",
    primaryAction = "Start free trial",
    secondaryAction = "Talk to sales",
    error,
    loading = false,
    disabled = false,
    onprimaryaction,
    onsecondaryaction,
    onretry,
  }: Props = $props();

  const hasActions = $derived(Boolean(primaryAction || secondaryAction));
</script>

<section class="@container moderno-block-cta">
  <div class="rounded-lg border border-border bg-card px-6 py-10 text-card-foreground @lg:px-10">
    {#if loading}
      <div
        role="status"
        aria-busy="true"
        class="grid justify-items-center gap-6 @lg:flex @lg:items-center @lg:justify-between @lg:gap-10"
      >
        <div aria-hidden="true" class="grid w-full max-w-md justify-items-center gap-3 @lg:justify-items-start">
          <Skeleton shape="text" class="h-7 w-3/4 @md:h-8" />
          <Skeleton shape="text" class="w-full" />
        </div>
        <div aria-hidden="true" class="flex gap-3 @lg:shrink-0">
          <Skeleton shape="rect" class="h-10 w-32" />
          <Skeleton shape="rect" class="h-10 w-28" />
        </div>
        <span class="sr-only">Loading…</span>
      </div>
    {:else}
      <div
        class="grid justify-items-center gap-6 text-center @lg:flex @lg:items-center @lg:justify-between @lg:gap-10 @lg:text-start"
      >
        <div class="grid max-w-md gap-2">
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{title}</h2>
          {#if description}
            <p class="text-body text-pretty text-muted-foreground">{description}</p>
          {/if}
        </div>

        {#if error}
          <Alert.Root variant="error" class="w-full max-w-md text-start @lg:max-w-sm">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>The rest of the page still works.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        {:else if hasActions}
          <div class="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center @lg:shrink-0">
            {#if primaryAction}
              <Button type="button" {disabled} onclick={onprimaryaction}>
                {primaryAction}
              </Button>
            {/if}
            {#if secondaryAction}
              <Button type="button" variant="outline" {disabled} onclick={onsecondaryaction}>
                {secondaryAction}
              </Button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</section>
