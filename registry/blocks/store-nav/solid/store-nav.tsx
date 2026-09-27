import { createMemo, createSignal, For, Show } from "solid-js";
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
} from "@moderno-ui/solid";

export interface StoreNavLink {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

export interface StoreNavMenu {
  id: string;
  label: string;
  links: StoreNavLink[];
}

export type StoreNavCategory = StoreNavLink | StoreNavMenu;

export interface StoreNavSuggestion {
  value: string;
  label: string;
  href: string;
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

function isMenu(category: StoreNavCategory): category is StoreNavMenu {
  return "links" in category;
}

function cartLabel(count: number) {
  return `Cart, ${count} ${count === 1 ? "item" : "items"}`;
}

function CategoryLink(props: { link: StoreNavLink; onNavigate?: () => void }) {
  return (
    <a
      href={props.link.disabled ? undefined : props.link.href}
      role={props.link.disabled ? "link" : undefined}
      aria-current={props.link.current ? "page" : undefined}
      aria-disabled={props.link.disabled || undefined}
      class="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
      onClick={() => props.onNavigate?.()}
    >
      {props.link.label}
    </a>
  );
}

function CategoryPlaceholders() {
  return (
    <div role="status" aria-busy="true" class="relative flex items-center gap-4 px-3">
      <span class="sr-only">Loading categories…</span>
      <For each={placeholders}>
        {() => <Skeleton aria-hidden="true" shape="text" class="w-16" />}
      </For>
    </div>
  );
}

export interface StoreNavProps {
  brand?: string;
  homeHref?: string;
  categories?: StoreNavCategory[];
  suggestions?: StoreNavSuggestion[];
  cartCount?: number;
  error?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
  onCart?: () => void;
  onRetry?: () => void;
}

export function StoreNav(props: StoreNavProps) {
  const brand = () => props.brand ?? "Northwind";
  const homeHref = () => props.homeHref ?? "/";
  const categories = () => props.categories ?? sampleCategories;
  const cartCount = () => props.cartCount ?? 2;
  const collapsible = () => !props.error && (!!props.loading || categories().length > 0);
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [suggestionsOpen, setSuggestionsOpen] = createSignal(false);
  const filters = useFilter({ sensitivity: "base" });
  const collection = createMemo(() =>
    createListCollection({
      items: (props.suggestions ?? sampleSuggestions).filter((suggestion) =>
        filters().contains(suggestion.label, query().trim()),
      ),
    }),
  );
  const closeDrawer = () => setDrawerOpen(false);

  function submitSearch(event: SubmitEvent) {
    event.preventDefault();
    setSuggestionsOpen(false);
    const form = event.currentTarget as HTMLFormElement;
    const trimmed = String(new FormData(form).get("q") ?? "").trim();
    if (trimmed) props.onSearch?.(trimmed);
  }

  return (
    <header class="@container moderno-block-store-nav border-b border-border bg-background text-foreground">
      <div class="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 @sm:px-6 @lg:gap-x-6 @lg:px-8">
        <a
          href={homeHref()}
          class="flex h-9 shrink-0 items-center rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {brand()}
        </a>

        <Show when={collapsible()}>
          <Show
            when={!props.loading}
            fallback={
              <div class="hidden min-w-0 @md:flex">
                <CategoryPlaceholders />
              </div>
            }
          >
            <nav aria-label="Categories" class="hidden min-w-0 @md:flex">
              <ul class="m-0 flex list-none items-center gap-1 p-0">
                <For each={categories()}>
                  {(category) => (
                    <li>
                      <Show
                        when={isMenu(category) && category}
                        fallback={<CategoryLink link={category as StoreNavLink} />}
                      >
                        {(menu) => (
                          <Menu.Root>
                            <Menu.Trigger class="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                              {menu().label}
                              <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                            </Menu.Trigger>
                            <Portal>
                              <Menu.Positioner>
                                <Menu.Content>
                                  <For each={menu().links}>
                                    {(link) => (
                                      <Menu.Item
                                        value={link.id}
                                        disabled={link.disabled}
                                        asChild={(itemProps) => (
                                          <a
                                            {...itemProps()}
                                            href={link.disabled ? undefined : link.href}
                                            class="no-underline"
                                          >
                                            {link.label}
                                          </a>
                                        )}
                                      />
                                    )}
                                  </For>
                                </Menu.Content>
                              </Menu.Positioner>
                            </Portal>
                          </Menu.Root>
                        )}
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            </nav>
          </Show>
        </Show>

        <Show when={collapsible()}>
          <Drawer.Root
            placement="right"
            lazyMount
            unmountOnExit
            open={drawerOpen()}
            onOpenChange={(details) => setDrawerOpen(details.open)}
          >
            <Drawer.Trigger
              asChild={(triggerProps) => (
                <Button
                  {...triggerProps()}
                  type="button"
                  variant="outline"
                  class="ms-auto @md:hidden"
                >
                  Menu
                </Button>
              )}
            />
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Title>{brand()}</Drawer.Title>
                  <Drawer.CloseTrigger aria-label="Close menu">×</Drawer.CloseTrigger>
                  <Show when={!props.loading} fallback={<CategoryPlaceholders />}>
                    <nav aria-label="Categories">
                      <ul class="m-0 grid list-none gap-1 p-0">
                        <For each={categories()}>
                          {(category) => (
                            <li>
                              <Show
                                when={isMenu(category) && category}
                                fallback={
                                  <CategoryLink
                                    link={category as StoreNavLink}
                                    onNavigate={closeDrawer}
                                  />
                                }
                              >
                                {(menu) => (
                                  <>
                                    <p class="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground">
                                      {menu().label}
                                    </p>
                                    <ul class="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                                      <For each={menu().links}>
                                        {(link) => (
                                          <li>
                                            <CategoryLink link={link} onNavigate={closeDrawer} />
                                          </li>
                                        )}
                                      </For>
                                    </ul>
                                  </>
                                )}
                              </Show>
                            </li>
                          )}
                        </For>
                      </ul>
                    </nav>
                  </Show>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        </Show>

        <div class="flex w-full items-center gap-2 @lg:ms-auto @lg:w-auto @lg:max-w-sm @lg:flex-1">
          <form role="search" class="relative w-32 min-w-0 flex-1" onSubmit={submitSearch}>
            <Combobox.Root
              name="q"
              collection={collection()}
              allowCustomValue
              open={suggestionsOpen()}
              onOpenChange={(details) => setSuggestionsOpen(details.open)}
              onInputValueChange={(details) => setQuery(details.inputValue)}
            >
              <Combobox.Label class="sr-only">Search products</Combobox.Label>
              <Combobox.Control>
                <Combobox.Input placeholder="Search products" />
              </Combobox.Control>
              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content>
                    <Combobox.Empty>No suggestions. Press Enter to search.</Combobox.Empty>
                    <For each={collection().items}>
                      {(suggestion) => (
                        <Combobox.Item
                          item={suggestion}
                          asChild={(itemProps) => (
                            <a {...itemProps()} href={suggestion.href} class="no-underline">
                              <Combobox.ItemText>{suggestion.label}</Combobox.ItemText>
                            </a>
                          )}
                        />
                      )}
                    </For>
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
          </form>

          <Button
            type="button"
            variant="ghost"
            class="shrink-0"
            aria-label={cartLabel(cartCount())}
            onClick={() => props.onCart?.()}
          >
            Cart
            <Badge variant={cartCount() > 0 ? "solid" : "neutral"} size="sm">
              {cartCount()}
            </Badge>
          </Button>
        </div>
      </div>

      <Show when={props.error}>
        <div class="px-4 pb-4 @sm:px-6 @lg:px-8">
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{props.error}</Alert.Title>
              <Alert.Description>Search and your cart still work.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        </div>
      </Show>
    </header>
  );
}
