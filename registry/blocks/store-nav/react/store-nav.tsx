import { useState, type FormEvent } from "react";
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
} from "@moderno-ui/react";

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

function cartLabel(count: number) {
  return `Cart, ${count} ${count === 1 ? "item" : "items"}`;
}

function CategoryLink({ link, onNavigate }: { link: StoreNavLink; onNavigate?: () => void }) {
  return (
    <a
      href={link.disabled ? undefined : link.href}
      role={link.disabled ? "link" : undefined}
      aria-current={link.current ? "page" : undefined}
      aria-disabled={link.disabled || undefined}
      className="flex h-9 items-center rounded-md px-3 text-ui-md whitespace-nowrap text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
      onClick={onNavigate}
    >
      {link.label}
    </a>
  );
}

function CategoryPlaceholders() {
  return (
    <div role="status" aria-busy="true" className="relative flex items-center gap-4 px-3">
      <span className="sr-only">Loading categories…</span>
      {placeholders.map((key) => (
        <Skeleton key={key} aria-hidden="true" shape="text" className="w-16" />
      ))}
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

export function StoreNav({
  brand = "Northwind",
  homeHref = "/",
  categories = sampleCategories,
  suggestions = sampleSuggestions,
  cartCount = 2,
  error,
  loading = false,
  onSearch,
  onCart,
  onRetry,
}: StoreNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const { contains } = useFilter({ sensitivity: "base" });
  const collection = createListCollection({
    items: suggestions.filter((suggestion) => contains(suggestion.label, query.trim())),
  });
  const collapsible = !error && (loading || categories.length > 0);
  const closeDrawer = () => setDrawerOpen(false);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuggestionsOpen(false);
    const trimmed = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (trimmed) onSearch?.(trimmed);
  }

  return (
    <header className="@container moderno-block-store-nav border-b border-border bg-background text-foreground">
      <div className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 @sm:px-6 @lg:gap-x-6 @lg:px-8">
        <a
          href={homeHref}
          className="flex h-9 shrink-0 items-center rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {brand}
        </a>

        {collapsible ? (
          loading ? (
            <div className="hidden min-w-0 @md:flex">
              <CategoryPlaceholders />
            </div>
          ) : (
            <nav aria-label="Categories" className="hidden min-w-0 @md:flex">
              <ul className="m-0 flex list-none items-center gap-1 p-0">
                {categories.map((category) => (
                  <li key={category.id}>
                    {"links" in category ? (
                      <Menu.Root>
                        <Menu.Trigger className="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                          {category.label}
                          <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              {category.links.map((link) => (
                                <Menu.Item
                                  key={link.id}
                                  value={link.id}
                                  disabled={link.disabled}
                                  asChild
                                >
                                  <a
                                    href={link.disabled ? undefined : link.href}
                                    className="no-underline"
                                  >
                                    {link.label}
                                  </a>
                                </Menu.Item>
                              ))}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    ) : (
                      <CategoryLink link={category} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )
        ) : null}

        {collapsible ? (
          <Drawer.Root
            placement="right"
            lazyMount
            unmountOnExit
            open={drawerOpen}
            onOpenChange={(details) => setDrawerOpen(details.open)}
          >
            <Drawer.Trigger asChild>
              <Button type="button" variant="outline" className="ms-auto @md:hidden">
                Menu
              </Button>
            </Drawer.Trigger>
            <Portal>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Title>{brand}</Drawer.Title>
                  <Drawer.CloseTrigger aria-label="Close menu">×</Drawer.CloseTrigger>
                  {loading ? (
                    <CategoryPlaceholders />
                  ) : (
                    <nav aria-label="Categories">
                      <ul className="m-0 grid list-none gap-1 p-0">
                        {categories.map((category) => (
                          <li key={category.id}>
                            {"links" in category ? (
                              <>
                                <p className="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground">
                                  {category.label}
                                </p>
                                <ul className="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                                  {category.links.map((link) => (
                                    <li key={link.id}>
                                      <CategoryLink link={link} onNavigate={closeDrawer} />
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              <CategoryLink link={category} onNavigate={closeDrawer} />
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        ) : null}

        <div className="flex w-full items-center gap-2 @lg:ms-auto @lg:w-auto @lg:max-w-sm @lg:flex-1">
          <form role="search" className="relative min-w-0 flex-1" onSubmit={submitSearch}>
            <Combobox.Root
              name="q"
              collection={collection}
              allowCustomValue
              open={suggestionsOpen}
              onOpenChange={(details) => setSuggestionsOpen(details.open)}
              onInputValueChange={(details) => setQuery(details.inputValue)}
            >
              <Combobox.Label className="sr-only">Search products</Combobox.Label>
              <Combobox.Control>
                <Combobox.Input placeholder="Search products" />
              </Combobox.Control>
              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content>
                    <Combobox.Empty>No suggestions. Press Enter to search.</Combobox.Empty>
                    {collection.items.map((suggestion) => (
                      <Combobox.Item key={suggestion.value} item={suggestion} asChild>
                        <a href={suggestion.href} className="no-underline">
                          <Combobox.ItemText>{suggestion.label}</Combobox.ItemText>
                        </a>
                      </Combobox.Item>
                    ))}
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            aria-label={cartLabel(cartCount)}
            onClick={onCart}
          >
            Cart
            <Badge variant={cartCount > 0 ? "solid" : "neutral"} size="sm">
              {cartCount}
            </Badge>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="px-4 pb-4 @sm:px-6 @lg:px-8">
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Search and your cart still work.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        </div>
      ) : null}
    </header>
  );
}
