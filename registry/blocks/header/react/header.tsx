import { useState } from "react";
import { Alert, Button, Drawer, Menu, Portal, Skeleton } from "@moderno-ui/react";

export interface HeaderLink {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

export interface HeaderMenu {
  id: string;
  label: string;
  links: HeaderLink[];
}

export type HeaderNavItem = HeaderLink | HeaderMenu;

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

function NavLink({ link, onNavigate }: { link: HeaderLink; onNavigate?: () => void }) {
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

function NavPlaceholders() {
  return (
    <div role="status" aria-busy="true" className="flex items-center gap-4 px-3">
      <span className="sr-only">Loading navigation…</span>
      {placeholders.map((key) => (
        <Skeleton key={key} aria-hidden="true" shape="text" className="w-16" />
      ))}
    </div>
  );
}

export interface HeaderProps {
  brand?: string;
  homeHref?: string;
  navigation?: HeaderNavItem[];
  action?: string;
  error?: string;
  loading?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function Header({
  brand = "Northwind",
  homeHref = "/",
  navigation = sampleNavigation,
  action = "Get started",
  error,
  loading = false,
  onAction,
  onRetry,
}: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const collapsible = !error && (loading || navigation.length > 0);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header className="@container moderno-block-header border-b border-border bg-background text-foreground">
      <div className="flex h-16 items-center gap-4 px-4 @sm:px-6 @lg:gap-8 @lg:px-8">
        <a
          href={homeHref}
          className="shrink-0 rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {brand}
        </a>

        {collapsible ? (
          loading ? (
            <div className="hidden min-w-0 @md:flex">
              <NavPlaceholders />
            </div>
          ) : (
            <nav aria-label="Main" className="hidden min-w-0 @md:flex">
              <ul className="m-0 flex list-none items-center gap-1 p-0">
                {navigation.map((item) => (
                  <li key={item.id}>
                    {"links" in item ? (
                      <Menu.Root>
                        <Menu.Trigger className="h-9 border-transparent bg-transparent font-normal text-muted-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
                          {item.label}
                          <Menu.Indicator aria-hidden="true">▾</Menu.Indicator>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              {item.links.map((link) => (
                                <Menu.Item
                                  key={link.id}
                                  value={link.id}
                                  disabled={link.disabled}
                                  asChild
                                >
                                  <a href={link.disabled ? undefined : link.href}>{link.label}</a>
                                </Menu.Item>
                              ))}
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    ) : (
                      <NavLink link={item} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )
        ) : null}

        <div className="ms-auto flex shrink-0 items-center gap-2">
          {action ? (
            <Button
              type="button"
              size="sm"
              className={collapsible ? "hidden @sm:inline-flex" : undefined}
              onClick={onAction}
            >
              {action}
            </Button>
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
                <Button type="button" variant="outline" size="sm" className="@md:hidden">
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
                      <NavPlaceholders />
                    ) : (
                      <nav aria-label="Main">
                        <ul className="m-0 grid list-none gap-1 p-0">
                          {navigation.map((item) => (
                            <li key={item.id}>
                              {"links" in item ? (
                                <>
                                  <p className="px-3 pt-3 pb-1 text-ui-sm font-semibold text-muted-foreground">
                                    {item.label}
                                  </p>
                                  <ul className="m-0 ms-3 grid list-none gap-1 border-s border-border p-0 ps-2">
                                    {item.links.map((link) => (
                                      <li key={link.id}>
                                        <NavLink link={link} onNavigate={closeDrawer} />
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              ) : (
                                <NavLink link={item} onNavigate={closeDrawer} />
                              )}
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                    {action ? (
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => {
                          closeDrawer();
                          onAction?.();
                        }}
                      >
                        {action}
                      </Button>
                    ) : null}
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="px-4 pb-4 @sm:px-6 @lg:px-8">
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>The rest of the page still works.</Alert.Description>
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
