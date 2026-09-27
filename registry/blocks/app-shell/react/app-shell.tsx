import { useState, type ReactNode } from "react";
import { Alert, Avatar, Button, Drawer, Menu, Portal, Skeleton } from "@moderno-ui/react";

export interface AppShellNavItem {
  id: string;
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
}

export interface AppShellUser {
  name: string;
  email: string;
  image?: string;
}

export type AppShellUserAction = "profile" | "settings" | "sign-out";

const sampleNavigation: AppShellNavItem[] = [
  { id: "overview", label: "Overview", href: "/overview", current: true },
  { id: "transactions", label: "Transactions", href: "/transactions" },
  { id: "invoices", label: "Invoices", href: "/invoices" },
  { id: "customers", label: "Customers", href: "/customers" },
  { id: "settings", label: "Settings", href: "/settings" },
];

const sampleUser: AppShellUser = { name: "Ada Lovelace", email: "ada@acme.com" };

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

function NavLinks({ items, onNavigate }: { items: AppShellNavItem[]; onNavigate?: () => void }) {
  return (
    <ul className="m-0 grid list-none gap-1 p-0">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.disabled ? undefined : item.href}
            role={item.disabled ? "link" : undefined}
            aria-current={item.current ? "page" : undefined}
            aria-disabled={item.disabled || undefined}
            className="flex h-9 items-center rounded-md px-3 text-ui-md text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
            onClick={onNavigate}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export interface AppShellProps {
  brand?: string;
  heading?: string;
  navigation?: AppShellNavItem[];
  user?: AppShellUser;
  error?: string;
  loading?: boolean;
  children?: ReactNode;
  onRetry?: () => void;
  onUserSelect?: (action: AppShellUserAction) => void;
}

export function AppShell({
  brand = "Acme",
  heading = "Overview",
  navigation = sampleNavigation,
  user = sampleUser,
  error,
  loading = false,
  children,
  onRetry,
  onUserSelect,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initials = initialsOf(user.name);

  return (
    <div className="@container moderno-block-app-shell text-foreground">
      <div className="grid min-h-full bg-background @md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="hidden border-e border-border @md:flex @md:w-56 @md:flex-col @lg:w-64">
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            <p className="truncate text-ui-lg font-semibold">{brand}</p>
          </div>
          <nav aria-label="Main" className="p-3">
            <NavLinks items={navigation} />
          </nav>
        </div>

        <div className="grid min-w-0 grid-rows-[auto_1fr]">
          <header className="flex h-14 items-center gap-3 border-b border-border px-4 @sm:px-6 @lg:px-8">
            <Drawer.Root
              placement="left"
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
                    <nav aria-label="Main">
                      <NavLinks items={navigation} onNavigate={() => setDrawerOpen(false)} />
                    </nav>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>

            <h1 className="min-w-0 flex-1 truncate font-serif text-heading-sm">{heading}</h1>

            <Menu.Root onSelect={(details) => onUserSelect?.(details.value as AppShellUserAction)}>
              <Menu.Trigger aria-label={user.name}>
                <span className="@sm:hidden">{initials}</span>
                <span className="hidden @sm:inline">{user.name}</span>
                <Menu.Indicator>▾</Menu.Indicator>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <div className="flex items-center gap-3 p-2">
                      <Avatar.Root size="sm">
                        <Avatar.Fallback>{initials}</Avatar.Fallback>
                        {user.image ? <Avatar.Image src={user.image} alt={user.name} /> : null}
                      </Avatar.Root>
                      <div className="grid min-w-0">
                        <span className="truncate text-ui-md font-medium">{user.name}</span>
                        <span className="truncate text-ui-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <Menu.Separator />
                    <Menu.Item value="profile">Profile</Menu.Item>
                    <Menu.Item value="settings">Settings</Menu.Item>
                    <Menu.Separator />
                    <Menu.Item value="sign-out">Sign out</Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </header>

          <main className="min-w-0 p-4 @sm:p-6 @lg:p-8">
            {error ? (
              <Alert.Root variant="error">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>Your data is safe. Try again in a moment.</Alert.Description>
                  <Alert.Action>
                    <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                      Try again
                    </Button>
                  </Alert.Action>
                </Alert.Content>
              </Alert.Root>
            ) : loading ? (
              <div role="status" aria-busy="true" className="grid gap-4 @lg:grid-cols-3">
                <span className="sr-only">Loading this page…</span>
                {[0, 1, 2].map((key) => (
                  <Skeleton key={key} shape="rect" className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              (children ?? (
                <div className="grid justify-items-center gap-1 rounded-lg border border-dashed border-border px-4 py-12 text-center">
                  <p className="text-body font-medium">Nothing here yet</p>
                  <p className="text-ui-md text-muted-foreground">
                    What you add to this page shows up here.
                  </p>
                </div>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
