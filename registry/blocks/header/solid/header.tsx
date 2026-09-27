import { createSignal, For, Show } from "solid-js";
import { Alert, Button, Drawer, Menu, Portal, Skeleton } from "@moderno-ui/solid";

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

function isMenu(item: HeaderNavItem): item is HeaderMenu {
  return "links" in item;
}

function NavLink(props: { link: HeaderLink; onNavigate?: () => void }) {
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

function NavPlaceholders() {
  return (
    <div role="status" aria-busy="true" class="flex items-center gap-4 px-3">
      <span class="sr-only">Loading navigation…</span>
      <For each={placeholders}>
        {() => <Skeleton aria-hidden="true" shape="text" class="w-16" />}
      </For>
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

export function Header(props: HeaderProps) {
  const brand = () => props.brand ?? "Northwind";
  const homeHref = () => props.homeHref ?? "/";
  const navigation = () => props.navigation ?? sampleNavigation;
  const action = () => props.action ?? "Get started";
  const collapsible = () => !props.error && (!!props.loading || navigation().length > 0);
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header class="@container moderno-block-header border-b border-border bg-background text-foreground">
      <div class="flex h-16 items-center gap-4 px-4 @sm:px-6 @lg:gap-8 @lg:px-8">
        <a
          href={homeHref()}
          class="shrink-0 rounded-sm font-serif text-heading-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {brand()}
        </a>

        <Show when={collapsible()}>
          <Show
            when={!props.loading}
            fallback={
              <div class="hidden min-w-0 @md:flex">
                <NavPlaceholders />
              </div>
            }
          >
            <nav aria-label="Main" class="hidden min-w-0 @md:flex">
              <ul class="m-0 flex list-none items-center gap-1 p-0">
                <For each={navigation()}>
                  {(item) => (
                    <li>
                      <Show
                        when={isMenu(item) && item}
                        fallback={<NavLink link={item as HeaderLink} />}
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

        <div class="ms-auto flex shrink-0 items-center gap-2">
          <Show when={action()}>
            <Button
              type="button"
              size="sm"
              class={collapsible() ? "hidden @sm:inline-flex" : undefined}
              onClick={() => props.onAction?.()}
            >
              {action()}
            </Button>
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
                    size="sm"
                    class="@md:hidden"
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
                    <Show when={!props.loading} fallback={<NavPlaceholders />}>
                      <nav aria-label="Main">
                        <ul class="m-0 grid list-none gap-1 p-0">
                          <For each={navigation()}>
                            {(item) => (
                              <li>
                                <Show
                                  when={isMenu(item) && item}
                                  fallback={
                                    <NavLink link={item as HeaderLink} onNavigate={closeDrawer} />
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
                                              <NavLink link={link} onNavigate={closeDrawer} />
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
                    <Show when={action()}>
                      <Button
                        type="button"
                        class="w-full"
                        onClick={() => {
                          closeDrawer();
                          props.onAction?.();
                        }}
                      >
                        {action()}
                      </Button>
                    </Show>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </Show>
        </div>
      </div>

      <Show when={props.error}>
        <div class="px-4 pb-4 @sm:px-6 @lg:px-8">
          <Alert.Root variant="error" size="sm">
            <Alert.Content>
              <Alert.Title>{props.error}</Alert.Title>
              <Alert.Description>The rest of the page still works.</Alert.Description>
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
