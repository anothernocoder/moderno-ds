<script lang="ts">
  import { Alert, Button, Drawer, Menu, Portal, Skeleton } from "@moderno-ui/svelte";

  interface HeaderLink {
    id: string;
    label: string;
    href: string;
    current?: boolean;
    disabled?: boolean;
  }

  interface HeaderMenu {
    id: string;
    label: string;
    links: HeaderLink[];
  }

  type HeaderNavItem = HeaderLink | HeaderMenu;

  interface Props {
    brand?: string;
    homeHref?: string;
    navigation?: HeaderNavItem[];
    action?: string;
    error?: string;
    loading?: boolean;
    onaction?: () => void;
    onretry?: () => void;
  }

  const sampleNavigation: HeaderNavItem[] = [
    {
      id: "product",
      label: "Product",
      links: [
        { id: "invoicing", label: "Invoicing", href: "/invoicing" },
        { id: "time-tracking", label: "Time tracking", href: "/time-tracking" },
        { id: "receipts", label: "Receipts", href: "/receipts" },
      ],
    },
    { id: "pricing", label: "Pricing", href: "/pricing" },
    { id: "customers", label: "Customers", href: "/customers" },
  ];

  const placeholders = ["first", "second", "third"];


  let {
    brand = "Northwind",
    homeHref = "/",
    navigation = sampleNavigation,
    action = "Get started",
    error,
    loading = false,
    onaction,
    onretry,
  }: Props = $props();

  let drawerOpen = $state(false);

  const collapsible = $derived(!error && (loading || navigation.length > 0));

  function actFromDrawer() {
    drawerOpen = false;
    onaction?.();
  }
</script>

{#snippet navLink(link: HeaderLink, onNavigate?: () => void)}
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

{#snippet navPlaceholders()}
  <div role="status" aria-busy="true" class="flex items-center gap-4 px-3">
    <span class="sr-only">Loading navigation…</span>
    {#each placeholders as key (key)}
      <Skeleton aria-hidden="true" shape="text" class="w-16" />
    {/each}
  </div>
{/snippet}

<header
  class="@container moderno-block-header border-b border-border bg-background text-foreground"
>
  <div class="flex h-16 items-center gap-4 px-4 @sm:px-6 @lg:gap-8 @lg:px-8">
    <a
      href={homeHref}
      class="shrink-0 rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {brand}
    </a>

    {#if collapsible}
      {#if loading}
        <div class="hidden min-w-0 @md:flex">
          {@render navPlaceholders()}
        </div>
      {:else}
        <nav aria-label="Main" class="hidden min-w-0 @md:flex">
          <ul class="m-0 flex list-none items-center gap-1 p-0">
            {#each navigation as item (item.id)}
              <li>
                {#if "links" in item}
                  <Menu.Root>
                    <Menu.Trigger
                      class="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                    >
                      {item.label}
                      <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          {#each item.links as link (link.id)}
                            <Menu.Item value={link.id} disabled={link.disabled}>
                              {#snippet asChild(itemProps)}
                                <a {...itemProps()} href={link.disabled ? undefined : link.href}>
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
                  {@render navLink(item)}
                {/if}
              </li>
            {/each}
          </ul>
        </nav>
      {/if}
    {/if}

    <div class="ms-auto flex shrink-0 items-center gap-2">
      {#if action}
        <Button
          type="button"
          size="sm"
          class={collapsible ? "hidden @sm:inline-flex" : undefined}
          onclick={onaction}
        >
          {action}
        </Button>
      {/if}

      {#if collapsible}
        <Drawer.Root placement="right" lazyMount unmountOnExit bind:open={drawerOpen}>
          <Drawer.Trigger>
            {#snippet asChild(triggerProps)}
              <Button
                {...triggerProps()}
                type="button"
                variant="outline"
                size="sm"
                class="@md:hidden"
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
                  {@render navPlaceholders()}
                {:else}
                  <nav aria-label="Main">
                    <ul class="m-0 grid list-none gap-1 p-0">
                      {#each navigation as item (item.id)}
                        <li>
                          {#if "links" in item}
                            <p
                              class="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground"
                            >
                              {item.label}
                            </p>
                            <ul class="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                              {#each item.links as link (link.id)}
                                <li>{@render navLink(link, () => (drawerOpen = false))}</li>
                              {/each}
                            </ul>
                          {:else}
                            {@render navLink(item, () => (drawerOpen = false))}
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  </nav>
                {/if}
                {#if action}
                  <Button type="button" class="w-full" onclick={actFromDrawer}>{action}</Button>
                {/if}
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="px-4 pb-4 @sm:px-6 @lg:px-8">
      <Alert.Root variant="error" size="sm">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The rest of the page still works.</Alert.Description>
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
