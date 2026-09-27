<script lang="ts">
  import { Alert, Button, Skeleton } from "@moderno-ui/svelte";

  interface Props {
    offer?: string;
    detail?: string;
    code?: string;
    actionLabel?: string;
    dismissible?: boolean;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaction?: () => void;
    oncopy?: (code: string) => void;
    ondismiss?: () => void;
    onretry?: () => void;
  }

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

  let {
    offer = "20% off annual plans",
    detail = "Ends Sunday",
    code = "MONTHEND20",
    actionLabel = "Claim offer",
    dismissible = true,
    error,
    loading = false,
    disabled = false,
    onaction,
    oncopy,
    ondismiss,
    onretry,
  }: Props = $props();

  let copied = $state(false);
  let dismissed = $state(false);

  const showPromo = $derived(!error && !loading && !dismissed && Boolean(offer || detail));

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    copied = true;
    oncopy?.(code);
  }

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

<div class="@container moderno-block-promo text-foreground">
  {#if error}
    <Alert.Root variant="error">
      <Alert.Icon>{@render icon(errorPaths)}</Alert.Icon>
      <Alert.Content>
        <Alert.Title>{error}</Alert.Title>
        <Alert.Description>The offer shows here once it loads.</Alert.Description>
        <Alert.Action>
          <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>Try again</Button>
        </Alert.Action>
      </Alert.Content>
    </Alert.Root>
  {/if}

  {#if loading}
    <div role="status" aria-busy="true">
      <div aria-hidden="true" class="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
        <Skeleton shape="text" class="w-1/2" />
        <Skeleton shape="rect" class="ms-auto h-8 w-24 shrink-0" />
        <Skeleton shape="rect" class="h-8 w-24 shrink-0" />
      </div>
      <span class="sr-only">Loading the offer…</span>
    </div>
  {/if}

  {#if showPromo}
    <section
      aria-label="Promotion"
      class="flex items-start gap-3 border-b border-border bg-muted px-4 py-3 @lg:items-center @lg:px-6"
    >
      <span aria-hidden="true" class="hidden @lg:block @lg:flex-1"></span>
      <div
        class="grid min-w-0 flex-1 gap-3 @md:flex @md:items-center @md:justify-between @md:gap-4 @lg:max-w-lg @lg:flex-initial"
      >
        <p class="grid gap-1 text-body @sm:block @md:grid @lg:block">
          {#if offer}
            <strong class="font-semibold">{offer}</strong>
          {/if}
          {#if offer && detail}
            <span aria-hidden="true" class="hidden text-muted-foreground @sm:mx-2 @sm:inline @md:hidden @lg:inline">·</span>
          {/if}
          {#if detail}
            <span class="text-muted-foreground">{detail}</span>
          {/if}
        </p>
        {#if code || actionLabel}
          <div class="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-nowrap">
            {#if code}
              <Button
                type="button"
                variant="outline"
                size="sm"
                {disabled}
                aria-label={`Copy code ${code}`}
                onclick={copyCode}
              >
                <span class="font-mono">{code}</span>
                {@render icon(copied ? copiedPaths : copyPaths)}
              </Button>
            {/if}
            {#if actionLabel}
              <Button type="button" size="sm" {disabled} onclick={onaction}>
                {actionLabel}
                {@render icon(arrowPaths)}
              </Button>
            {/if}
          </div>
        {/if}
      </div>
      <div class="flex shrink-0 @lg:flex-1 @lg:justify-end">
        {#if dismissible}
          <Button type="button" variant="ghost" size="sm" {disabled} aria-label="Dismiss promotion" onclick={dismiss}>
            {@render icon(dismissPaths)}
          </Button>
        {/if}
      </div>
      <span role="status" class="sr-only">{copied ? "Code copied" : ""}</span>
    </section>
  {/if}
</div>
