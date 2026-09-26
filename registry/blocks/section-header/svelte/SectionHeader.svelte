<script lang="ts">
  import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  type SectionHeaderVariant = "page" | "section" | "card";

  type SectionHeaderTone = "neutral" | "info" | "success" | "warning" | "error";

  interface SectionHeaderCrumb {
    label: string;
    href?: string;
  }

  interface SectionHeaderStatus {
    label: string;
    tone?: SectionHeaderTone;
  }

  interface Props {
    variant?: SectionHeaderVariant;
    heading?: string;
    description?: string;
    breadcrumbs?: SectionHeaderCrumb[];
    status?: SectionHeaderStatus | null;
    meta?: string[];
    count?: number;
    primaryLabel?: string;
    secondaryLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onprimaryaction?: () => void;
    onsecondaryaction?: () => void;
    onretry?: () => void;
  }

  const sampleCrumbs: SectionHeaderCrumb[] = [
    { label: "Projects", href: "#" },
    { label: "Marketing", href: "#" },
    { label: "Q3 redesign" },
  ];

  const sampleStatus: SectionHeaderStatus = { label: "Active", tone: "success" };

  const sampleMeta = ["Due Oct 14", "Owned by Ada Lovelace"];

  const headingTags = { page: "h1", section: "h2", card: "h3" } as const;

  let {
    variant = "page",
    heading = "Q3 redesign",
    description = "Refresh the marketing site and the onboarding flow before the October launch.",
    breadcrumbs = sampleCrumbs,
    status = sampleStatus,
    meta = sampleMeta,
    count,
    primaryLabel = "New task",
    secondaryLabel = "Share",
    error,
    loading = false,
    disabled = false,
    onprimaryaction,
    onsecondaryaction,
    onretry,
  }: Props = $props();

  const isPage = $derived(variant === "page");
  const inert = $derived(disabled || loading || Boolean(error));
  const showDetails = $derived(!loading && !error);
  const showCount = $derived(showDetails && count !== undefined);
  const showStatusLine = $derived(isPage && showDetails && (status !== null || meta.length > 0));
</script>

{#snippet bar()}
  <div class="grid gap-3">
    {#if isPage && breadcrumbs.length > 0}
      <nav aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-2 text-ui-sm text-muted-foreground">
          {#each breadcrumbs as crumb, index (crumb.label)}
            {@const current = index === breadcrumbs.length - 1}
            {@const parent = index === breadcrumbs.length - 2}
            <li class={parent ? "flex items-center gap-2" : "hidden items-center gap-2 @sm:flex"}>
              {#if parent}
                <span aria-hidden="true" class="@sm:hidden">←</span>
              {/if}
              {#if index > 0}
                <span aria-hidden="true" class="hidden @sm:inline">/</span>
              {/if}
              {#if crumb.href && !current}
                <a
                  class="rounded-sm transition-colors hover:text-foreground hover:underline underline-offset-4 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={crumb.href}
                >
                  {crumb.label}
                </a>
              {:else}
                <span aria-current={current ? "page" : undefined} class="font-medium text-foreground">
                  {crumb.label}
                </span>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>
    {/if}

    <div class="grid gap-4 @sm:flex @sm:items-start @sm:justify-between @sm:gap-6">
      {#if loading}
        <div role="status" aria-busy="true" class="grid min-w-0 flex-1 gap-2">
          <span class="sr-only">Loading…</span>
          <Skeleton shape="text" class="h-7 w-1/2 @md:h-8" />
          <Skeleton shape="text" class="w-3/4" />
          {#if isPage}
            <Skeleton shape="text" class="w-1/3" />
          {/if}
        </div>
      {:else}
        <div class="grid min-w-0 flex-1 gap-1">
          <svelte:element
            this={headingTags[variant]}
            class={variant === "page"
              ? "flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-heading-sm @md:text-heading @lg:text-heading-lg"
              : variant === "section"
                ? "flex flex-wrap items-center gap-x-3 gap-y-1 text-body-lg font-semibold @md:text-heading-sm"
                : "flex flex-wrap items-center gap-x-3 gap-y-1 text-body font-semibold"}
          >
            {heading}
            {#if showCount}
              <Badge variant="neutral" size="sm">{count}</Badge>
            {/if}
          </svelte:element>
          {#if description}
            <p class="text-ui-md text-muted-foreground @lg:text-body">{description}</p>
          {/if}
          {#if showStatusLine}
            <ul
              class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-ui-sm text-muted-foreground"
            >
              {#if status}
                <li class="flex">
                  <Badge variant={status.tone ?? "neutral"} size="sm" dot>{status.label}</Badge>
                </li>
              {/if}
              {#each meta as item (item)}
                <li>{item}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}

      {#if primaryLabel || secondaryLabel}
        <div class="flex gap-2 @sm:shrink-0">
          {#if secondaryLabel}
            <Button
              type="button"
              variant="outline"
              size={isPage ? "md" : "sm"}
              class="flex-1 @sm:flex-none"
              disabled={inert || count === 0}
              onclick={onsecondaryaction}
            >
              {secondaryLabel}
            </Button>
          {/if}
          {#if primaryLabel}
            <Button
              type="button"
              variant="primary"
              size={isPage ? "md" : "sm"}
              class="flex-1 @sm:flex-none"
              disabled={inert}
              onclick={onprimaryaction}
            >
              {primaryLabel}
            </Button>
          {/if}
        </div>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Only these details failed to load; nothing was lost.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {/if}
  </div>
{/snippet}

<header class="@container moderno-block-section-header text-foreground" data-variant={variant}>
  {#if variant === "card"}
    <Card.Root>
      <Card.Header>{@render bar()}</Card.Header>
    </Card.Root>
  {:else}
    <div class={variant === "section" ? "border-b border-border pb-4" : undefined}>
      {@render bar()}
    </div>
  {/if}
</header>
