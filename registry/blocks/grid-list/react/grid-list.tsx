import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

export type GridListStatus = "neutral" | "info" | "success" | "warning" | "error";

export interface GridListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  image?: string;
  status?: string;
  statusVariant?: GridListStatus;
  meta?: string;
}

const sampleItems: GridListItem[] = [
  {
    id: "checkout",
    title: "Checkout redesign",
    subtitle: "Product team",
    initials: "CR",
    status: "In progress",
    statusVariant: "info",
    meta: "Updated 2 hrs ago",
  },
  {
    id: "payments",
    title: "Payments API v2",
    subtitle: "Platform team",
    initials: "PA",
    status: "Blocked",
    statusVariant: "error",
    meta: "Updated yesterday",
  },
  {
    id: "campaign",
    title: "Summer campaign",
    subtitle: "Marketing",
    initials: "SC",
    status: "Paused",
    statusVariant: "warning",
    meta: "Updated 3 days ago",
  },
  {
    id: "migration",
    title: "Vue 3 migration",
    subtitle: "Platform team",
    initials: "VM",
    status: "Shipped",
    statusVariant: "success",
    meta: "Updated last week",
  },
  {
    id: "brand",
    title: "Brand refresh",
    subtitle: "Design",
    initials: "BR",
    status: "Draft",
    statusVariant: "neutral",
    meta: "Updated 2 weeks ago",
  },
  {
    id: "onboarding",
    title: "Mobile onboarding",
    subtitle: "Product team",
    initials: "MO",
    status: "In progress",
    statusVariant: "info",
    meta: "Updated last month",
  },
];

const placeholders = ["first", "second", "third"];

export interface GridListProps {
  items?: GridListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onOpen?: (id: string) => void;
  onCreate?: () => void;
  onRetry?: () => void;
}

export function GridList({
  items = sampleItems,
  heading = "Projects",
  description = "Everything your team is working on, most recent first.",
  error,
  loading = false,
  disabled = false,
  onOpen,
  onCreate,
  onRetry,
}: GridListProps) {
  const inert = loading || disabled;
  const showGrid = !error && !loading && items.length > 0;

  return (
    <section className="@container moderno-block-grid-list text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
            {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
          </div>
          <Button type="button" size="sm" disabled={inert} onClick={onCreate}>
            New project
          </Button>
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                Nothing was changed. Your projects are still saved.
              </Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : null}

        {loading ? (
          <div
            role="status"
            aria-busy="true"
            className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3"
          >
            <span className="sr-only">Loading projects…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} size="sm" aria-hidden="true">
                <Card.Header className="flex-row items-center gap-3">
                  <Skeleton shape="rect" className="size-10" />
                  <div className="grid flex-1 gap-2">
                    <Skeleton shape="text" className="w-3/4" />
                    <Skeleton shape="text" className="w-1/2" />
                  </div>
                </Card.Header>
                <Card.Content>
                  <Skeleton shape="text" className="w-1/3" />
                </Card.Content>
                <Card.Footer>
                  <Skeleton shape="text" className="h-8" />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        ) : null}

        {!error && !loading && items.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>No projects yet</Card.Title>
              <Card.Description>
                Projects you create or join show up here as cards.
              </Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showGrid ? (
          <ul className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="flex">
                <Card.Root size="sm">
                  <Card.Header className="flex-row items-center gap-3">
                    <Avatar.Root shape="square">
                      <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                      {item.image ? <Avatar.Image src={item.image} alt="" /> : null}
                    </Avatar.Root>
                    <div className="grid min-w-0 flex-1 gap-1">
                      <Card.Title className="truncate">{item.title}</Card.Title>
                      {item.subtitle ? (
                        <Card.Description className="truncate">{item.subtitle}</Card.Description>
                      ) : null}
                    </div>
                  </Card.Header>
                  <Card.Content className="flex-row flex-wrap items-center gap-2">
                    {item.status ? (
                      <Badge variant={item.statusVariant ?? "neutral"} dot>
                        {item.status}
                      </Badge>
                    ) : null}
                    {item.meta ? (
                      <span className="text-ui-sm text-muted-foreground">{item.meta}</span>
                    ) : null}
                  </Card.Content>
                  <Card.Footer>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={inert}
                      aria-label={`Open ${item.title}`}
                      onClick={() => onOpen?.(item.id)}
                    >
                      Open
                    </Button>
                  </Card.Footer>
                </Card.Root>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
