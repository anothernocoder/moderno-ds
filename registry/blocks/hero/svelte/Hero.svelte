<script lang="ts">
  import { Alert, Badge, Button, Skeleton } from "@moderno-ui/svelte";

  interface Props {
    kicker?: string;
    title?: string;
    subtitle?: string;
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
    kicker = "Now in public beta",
    title = "Run your business, not your books",
    subtitle = "Invoices, time tracking and receipts in one calm workspace, so the numbers are ready before you need them.",
    primaryAction = "Start free trial",
    secondaryAction = "Book a demo",
    error,
    loading = false,
    disabled = false,
    onprimaryaction,
    onsecondaryaction,
    onretry,
  }: Props = $props();

  const hasActions = $derived(Boolean(primaryAction || secondaryAction));
</script>

<section class="@container moderno-block-hero text-foreground">
  {#if loading}
    <div role="status" aria-busy="true" class="grid justify-items-center gap-6 px-4 py-12 @lg:py-24">
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
  {:else}
    <div class="grid justify-items-center gap-6 px-4 py-12 text-center @lg:py-24">
      {#if kicker}
        <Badge variant="neutral">{kicker}</Badge>
      {/if}

      <div class="grid max-w-lg gap-4">
        <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
        {#if subtitle}
          <p class="mx-auto max-w-md text-body text-muted-foreground @md:text-body-lg">
            {subtitle}
          </p>
        {/if}
      </div>

      {#if error}
        <Alert.Root variant="error" class="w-full max-w-md text-start">
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
            <Alert.Description>
              The rest of the page still works. Try again in a moment.
            </Alert.Description>
            <Alert.Action>
              <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
      {:else if hasActions}
        <div class="mt-2 grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
          {#if primaryAction}
            <Button type="button" size="lg" {disabled} onclick={onprimaryaction}>
              {primaryAction}
            </Button>
          {/if}
          {#if secondaryAction}
            <Button type="button" variant="outline" size="lg" {disabled} onclick={onsecondaryaction}>
              {secondaryAction}
            </Button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</section>
