<script lang="ts">
  import { Alert, Button, Chip, Skeleton } from "@moderno-ui/svelte";

  interface BlogCategory {
    id: string;
    label: string;
    href: string;
  }

  interface Props {
    kicker?: string;
    title?: string;
    description?: string;
    categories?: BlogCategory[];
    activeCategory?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
  }

  const sampleCategories: BlogCategory[] = [
    { id: "all", label: "All posts", href: "#" },
    { id: "product", label: "Product", href: "#" },
    { id: "engineering", label: "Engineering", href: "#" },
    { id: "design", label: "Design", href: "#" },
    { id: "company", label: "Company", href: "#" },
    { id: "guides", label: "Guides", href: "#" },
  ];

  let {
    kicker = "Blog",
    title = "Notes from the ledger",
    description = "Product updates, engineering deep dives and guides to closing the month without the stress.",
    categories = sampleCategories,
    activeCategory = "all",
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();
</script>

<header class="@container moderno-block-blog-header text-foreground">
  <div class="grid justify-items-center gap-8 px-4 py-12 text-center @lg:gap-10 @lg:py-16">
    <div class="grid max-w-md gap-3">
      {#if kicker}
        <p class="text-ui-sm font-medium text-muted-foreground">{kicker}</p>
      {/if}
      <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
      {#if description}
        <p class="text-ui-md text-pretty text-muted-foreground @sm:text-body">{description}</p>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error" class="w-full max-w-md text-start">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The posts still load. Try again to bring the categories back.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div role="status" aria-busy="true" class="flex flex-wrap justify-center gap-2 @md:gap-3">
        <span class="sr-only">Loading the categories…</span>
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-20" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-16" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-24" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-16" />
        <Skeleton aria-hidden="true" shape="rect" class="h-7 w-20" />
      </div>
    {:else if categories.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-3 text-ui-sm text-muted-foreground"
      >
        No categories yet.
      </p>
    {:else}
      <nav aria-label="Categories">
        <ul class="flex flex-wrap justify-center gap-2 @md:gap-3">
          {#each categories as category (category.id)}
            {@const active = category.id === activeCategory}
            <li class="flex">
              <a
                class="flex rounded-lg hover:[--border:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed"
                href={disabled ? undefined : category.href}
                role={disabled ? "link" : undefined}
                aria-disabled={disabled || undefined}
                aria-current={active ? "page" : undefined}
              >
                <Chip variant={active ? "solid" : disabled ? "muted" : "outline"}>
                  {category.label}
                </Chip>
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    {/if}
  </div>
</header>
