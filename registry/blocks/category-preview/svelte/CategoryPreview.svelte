<script lang="ts">
  import { Alert, Button, Card, Skeleton } from "@moderno-ui/svelte";

  interface CategorySummary {
    id: string;
    name: string;
    description: string;
    countLabel?: string;
    imageUrl?: string;
    href?: string;
  }

  interface Props {
    heading?: string;
    description?: string;
    allCategoriesHref?: string;
    categories?: CategorySummary[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
  }

  const sampleCategories: CategorySummary[] = [
    {
      id: "workspace",
      name: "Workspace",
      description: "Desks, chairs and lamps for the long days.",
      countLabel: "32 products",
      href: "#",
    },
    {
      id: "stationery",
      name: "Stationery",
      description: "Notebooks, pens and paper that hold up.",
      countLabel: "48 products",
      href: "#",
    },
    {
      id: "bags",
      name: "Bags",
      description: "Carry-alls for the commute and the weekend.",
      countLabel: "18 products",
      href: "#",
    },
    {
      id: "tech-accessories",
      name: "Tech accessories",
      description: "Stands, cables and cases in one place.",
      countLabel: "26 products",
      href: "#",
    },
  ];

  const placeholders = ["first", "second", "third", "fourth"];

  const linkClass =
    "rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline";

  let {
    heading = "Shop by category",
    description = "Everything in the store, sorted the way you shop.",
    allCategoriesHref = "#",
    categories = sampleCategories,
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-category-preview text-foreground">
  <div class="grid gap-10 px-4 py-12 @lg:py-16">
    <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
      <div class="grid max-w-md gap-3">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if description}
          <p class="text-body text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if allCategoriesHref}
        <a
          class="justify-self-start shrink-0 text-ui-md font-medium {linkClass}"
          href={disabled ? undefined : allCategoriesHref}
          role={disabled ? "link" : undefined}
          aria-disabled={disabled || undefined}>Browse all categories</a
        >
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The rest of the page still works. Try again in a moment.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div role="status" aria-busy="true" class="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4 @lg:gap-8">
        <span class="sr-only">Loading the categories…</span>
        {#each placeholders as key (key)}
          <Card.Root size="sm" class="overflow-hidden" aria-hidden="true">
            <Skeleton shape="rect" class="aspect-4/3 h-auto" />
            <Card.Header>
              <Skeleton shape="text" class="w-1/2" />
            </Card.Header>
            <Card.Content class="gap-2">
              <Skeleton shape="text" />
              <Skeleton shape="text" class="w-2/3" />
            </Card.Content>
            <Card.Footer>
              <Skeleton shape="text" class="w-1/3" />
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {:else if categories.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No categories to show yet.
      </p>
    {:else}
      <ul class="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4 @lg:gap-8">
        {#each categories as category (category.id)}
          <li class="flex">
            <Card.Root size="sm" class="relative overflow-hidden">
              <div class="flex aspect-4/3 items-center justify-center bg-muted">
                {#if category.imageUrl}
                  <img src={category.imageUrl} alt="" class="size-full object-cover" />
                {:else}
                  <span aria-hidden="true" class="font-serif text-heading-lg text-muted-foreground"
                    >{category.name.charAt(0)}</span
                  >
                {/if}
              </div>
              <Card.Header>
                <Card.Title class="text-balance">
                  {#if category.href}
                    <a
                      class="after:absolute after:inset-0 {linkClass}"
                      href={disabled ? undefined : category.href}
                      role={disabled ? "link" : undefined}
                      aria-disabled={disabled || undefined}>{category.name}</a
                    >
                  {:else}
                    {category.name}
                  {/if}
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <p class="text-pretty text-muted-foreground">{category.description}</p>
              </Card.Content>
              {#if category.countLabel}
                <Card.Footer>
                  <span class="text-ui-sm text-muted-foreground">{category.countLabel}</span>
                </Card.Footer>
              {/if}
            </Card.Root>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
