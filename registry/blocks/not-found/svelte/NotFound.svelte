<script lang="ts">
  import { Alert, Badge, Button, Skeleton } from "@moderno-ui/svelte";

  interface NotFoundLink {
    label: string;
    description?: string;
    href: string;
  }

  interface Props {
    code?: string;
    title?: string;
    description?: string;
    primaryAction?: string;
    secondaryAction?: string;
    linksTitle?: string;
    links?: NotFoundLink[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onprimaryaction?: () => void;
    onsecondaryaction?: () => void;
    onretry?: () => void;
  }

  const sampleLinks: NotFoundLink[] = [
    { label: "Pricing", description: "Plans for teams of every size.", href: "#" },
    { label: "Help centre", description: "Guides and answers to common questions.", href: "#" },
    { label: "Changelog", description: "What changed in the product this month.", href: "#" },
  ];

  const placeholders = ["first", "second", "third"];

  const splitLayout = "@lg:grid-cols-2 @lg:items-center";
  const splitMessage = "@lg:justify-items-start @lg:text-start";

  let {
    code = "404",
    title = "Page not found",
    description = "The page you are looking for has moved, or the link that brought you here is out of date.",
    primaryAction = "Back to home",
    secondaryAction = "Contact support",
    linksTitle = "Popular pages",
    links = sampleLinks,
    error,
    loading = false,
    disabled = false,
    onprimaryaction,
    onsecondaryaction,
    onretry,
  }: Props = $props();

  const hasActions = $derived(Boolean(primaryAction || secondaryAction));
  const hasPages = $derived(Boolean(error) || loading || links.length > 0);
</script>

<section class="@container moderno-block-not-found text-foreground">
  <div class="grid gap-12 px-4 py-12 @lg:gap-16 @lg:py-24 {hasPages ? splitLayout : ''}">
    <div class="grid justify-items-center gap-6 text-center {hasPages ? splitMessage : ''}">
      {#if code}
        <Badge variant="neutral">{code}</Badge>
      {/if}

      <div class="grid max-w-md gap-3">
        <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
        {#if description}
          <p class="text-body text-pretty text-muted-foreground">{description}</p>
        {/if}
      </div>

      {#if hasActions}
        <div class="grid w-full gap-3 @sm:flex @sm:w-auto @sm:justify-center">
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

    {#if error}
      <Alert.Root variant="error" class="w-full max-w-md justify-self-center @lg:max-w-none">
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
    {:else if loading}
      <div
        role="status"
        aria-busy="true"
        class="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
      >
        <span class="sr-only">Loading pages…</span>
        <Skeleton aria-hidden="true" shape="text" class="w-1/3" />
        <div aria-hidden="true" class="grid gap-5 rounded-lg border border-border p-4">
          {#each placeholders as key (key)}
            <div class="grid gap-2">
              <Skeleton shape="text" class="w-1/3" />
              <Skeleton shape="text" class="w-3/4" />
            </div>
          {/each}
        </div>
      </div>
    {:else if links.length > 0}
      <nav
        aria-label={linksTitle}
        class="grid w-full max-w-md gap-3 justify-self-center @lg:max-w-none"
      >
        <h2 class="text-ui-sm font-semibold text-muted-foreground">{linksTitle}</h2>
        <ul
          class="grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground"
        >
          {#each links as link (link.label)}
            <li class="grid">
              <a
                class="grid gap-1 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                href={link.href}
              >
                <span class="text-ui-md font-medium">{link.label}</span>
                {#if link.description}
                  <span class="text-ui-sm text-muted-foreground">{link.description}</span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </div>
</section>
