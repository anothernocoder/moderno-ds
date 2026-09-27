<script lang="ts">
  import {
    Alert,
    Badge,
    Button,
    Combobox,
    Drawer,
    Menu,
    Portal,
    Skeleton,
    createListCollection,
    useFilter,
  } from "@moderno-ui/svelte";

  interface StoreNavLink {
    id: string;
    label: string;
    href: string;
    current?: boolean;
    disabled?: boolean;
  }

  interface StoreNavMenu {
    id: string;
    label: string;
    links: StoreNavLink[];
  }

  type StoreNavCategory = StoreNavLink | StoreNavMenu;

  interface StoreNavSuggestion {
    value: string;
    label: string;
    href: string;
  }

  interface Props {
    brand?: string;
    homeHref?: string;
    categories?: StoreNavCategory[];
    suggestions?: StoreNavSuggestion[];
    cartCount?: number;
    error?: string;
    loading?: boolean;
    onsearch?: (query: string) => void;
    oncart?: () => void;
    onretry?: () => void;
  }

  const sampleCategories: StoreNavCategory[] = [
    {
      id: "workspace",
      label: "Workspace",
      links: [
        { id: "desks", label: "Desks", href: "/workspace/desks" },
        { id: "chairs", label: "Chairs", href: "/workspace/chairs" },
        { id: "lamps", label: "Lamps", href: "/workspace/lamps" },
      ],
    },
    {
      id: "stationery",
      label: "Stationery",
      links: [
        { id: "notebooks", label: "Notebooks", href: "/stationery/notebooks" },
        { id: "pens", label: "Pens", href: "/stationery/pens" },
        { id: "planners", label: "Planners", href: "/stationery/planners" },
      ],
    },
    { id: "bags", label: "Bags", href: "/bags" },
  ];

  const sampleSuggestions: StoreNavSuggestion[] = [
    { value: "oak-desk", label: "Oak standing desk", href: "/products/oak-standing-desk" },
    { value: "task-chair", label: "Mesh task chair", href: "/products/mesh-task-chair" },
    { value: "desk-lamp", label: "Brass desk lamp", href: "/products/brass-desk-lamp" },
    { value: "linen-notebook", label: "Linen notebook", href: "/products/linen-notebook" },
    { value: "fountain-pen", label: "Steel fountain pen", href: "/products/steel-fountain-pen" },
    { value: "canvas-tote", label: "Canvas tote", href: "/products/canvas-tote" },
  ];

  const placeholders = ["first", "second", "third"];

  let {
    brand = "Northwind",
    homeHref = "/",
    categories = sampleCategories,
    suggestions = sampleSuggestions,
    cartCount = 2,
    error,
    loading = false,
    onsearch,
    oncart,
    onretry,
  }: Props = $props();

  let drawerOpen = $state(false);
  let query = $state("");
  let suggestionsOpen = $state(false);

  const filters = useFilter({ sensitivity: "base" });
  const collection = $derived(
    createListCollection({
      items: suggestions.filter((suggestion) =>
        filters().contains(suggestion.label, query.trim()),
      ),
    }),
  );
  const collapsible = $derived(!error && (loading || categories.length > 0));
  const cartLabel = $derived(`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`);

  function submitSearch(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    suggestionsOpen = false;
    const trimmed = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (trimmed) onsearch?.(trimmed);
  }
</script>

{#snippet categoryLink(link: StoreNavLink, onNavigate?: () => void)}
  <a
    href={link.disabled ? undefined : link.href}
    role={link.disabled ? "link" : undefined}
    aria-current={link.current ? "page" : undefined}
    aria-disabled={link.disabled || undefined}
    class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
    onclick={onNavigate}
  >
    {link.label}
  </a>
{/snippet}

{#snippet categoryPlaceholders()}
  <div role="status" aria-busy="true" class="relative flex items-center gap-4 px-3">
    <span class="sr-only">Loading categories…</span>
    {#each placeholders as key (key)}
      <Skeleton aria-hidden="true" shape="text" class="w-16" />
    {/each}
  </div>
{/snippet}

<header
  class="@container moderno-block-store-nav border-b border-border bg-background text-foreground"
>
  <div
    class="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 @sm:px-6 @lg:gap-x-6 @lg:px-8"
  >
    <a
      href={homeHref}
      class="flex h-9 shrink-0 items-center rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {brand}
    </a>

    {#if collapsible}
      {#if loading}
        <div class="hidden min-w-0 @md:flex">
          {@render categoryPlaceholders()}
        </div>
      {:else}
        <nav aria-label="Categories" class="hidden min-w-0 @md:flex">
          <ul class="m-0 flex list-none items-center gap-1 p-0">
            {#each categories as category (category.id)}
              <li>
                {#if "links" in category}
                  <Menu.Root>
                    <Menu.Trigger
                      class="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                    >
                      {category.label}
                      <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          {#each category.links as link (link.id)}
                            <Menu.Item value={link.id} disabled={link.disabled}>
                              {#snippet asChild(itemProps)}
                                <a
                                  {...itemProps()}
                                  href={link.disabled ? undefined : link.href}
                                  class="no-underline"
                                >
                                  {link.label}
                                </a>
                              {/snippet}
                            </Menu.Item>
                          {/each}
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                {:else}
                  {@render categoryLink(category)}
                {/if}
              </li>
            {/each}
          </ul>
        </nav>
      {/if}
    {/if}

    {#if collapsible}
      <Drawer.Root placement="right" lazyMount unmountOnExit bind:open={drawerOpen}>
        <Drawer.Trigger>
          {#snippet asChild(triggerProps)}
            <Button
              {...triggerProps()}
              type="button"
              variant="outline"
              class="ms-auto @md:hidden"
            >
              Menu
            </Button>
          {/snippet}
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Title>{brand}</Drawer.Title>
              <Drawer.CloseTrigger aria-label="Close menu">×</Drawer.CloseTrigger>
              {#if loading}
                {@render categoryPlaceholders()}
              {:else}
                <nav aria-label="Categories">
                  <ul class="m-0 grid list-none gap-1 p-0">
                    {#each categories as category (category.id)}
                      <li>
                        {#if "links" in category}
                          <p
                            class="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground"
                          >
                            {category.label}
                          </p>
                          <ul class="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                            {#each category.links as link (link.id)}
                              <li>{@render categoryLink(link, () => (drawerOpen = false))}</li>
                            {/each}
                          </ul>
                        {:else}
                          {@render categoryLink(category, () => (drawerOpen = false))}
                        {/if}
                      </li>
                    {/each}
                  </ul>
                </nav>
              {/if}
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    {/if}

    <div class="flex w-full items-center gap-2 @lg:ms-auto @lg:w-auto @lg:max-w-sm @lg:flex-1">
      <form
        role="search"
        class="relative min-w-0 flex-1"
        onsubmit={submitSearch}
      >
        <Combobox.Root
          name="q"
          {collection}
          allowCustomValue
          bind:open={suggestionsOpen}
          bind:inputValue={query}
        >
          <Combobox.Label class="sr-only">Search products</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input placeholder="Search products" />
          </Combobox.Control>
          <Portal>
            <Combobox.Positioner>
              <Combobox.Content>
                <Combobox.Empty>No suggestions. Press Enter to search.</Combobox.Empty>
                {#each collection.items as suggestion (suggestion.value)}
                  <Combobox.Item item={suggestion}>
                    {#snippet asChild(itemProps)}
                      <a {...itemProps()} href={suggestion.href} class="no-underline">
                        <Combobox.ItemText>{suggestion.label}</Combobox.ItemText>
                      </a>
                    {/snippet}
                  </Combobox.Item>
                {/each}
              </Combobox.Content>
            </Combobox.Positioner>
          </Portal>
        </Combobox.Root>
      </form>

      <Button
        type="button"
        variant="ghost"
        class="shrink-0"
        aria-label={cartLabel}
        onclick={oncart}
      >
        Cart
        <Badge variant={cartCount > 0 ? "solid" : "neutral"} size="sm">{cartCount}</Badge>
      </Button>
    </div>
  </div>

  {#if error}
    <div class="px-4 pb-4 @sm:px-6 @lg:px-8">
      <Alert.Root variant="error" size="sm">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Search and your cart still work.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    </div>
  {/if}
</header>
