import { Alert, Avatar, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/react";

export interface ListContainerItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  initials: string;
  avatarUrl?: string;
  status?: string;
  statusVariant?: BadgeVariant;
}

const sampleItems: ListContainerItem[] = [
  {
    id: "onboarding",
    title: "Design the onboarding flow",
    subtitle: "Product",
    meta: "Due today",
    initials: "AL",
    status: "In progress",
    statusVariant: "info",
  },
  {
    id: "checkout-copy",
    title: "Review the checkout copy",
    subtitle: "Content",
    meta: "Due tomorrow",
    initials: "GH",
    status: "To do",
    statusVariant: "warning",
  },
  {
    id: "colour-tokens",
    title: "Migrate the colour tokens",
    subtitle: "Design",
    meta: "Yesterday",
    initials: "KJ",
    status: "Done",
    statusVariant: "success",
  },
  {
    id: "accessibility-audit",
    title: "Run the accessibility audit",
    subtitle: "QA",
    meta: "2 days ago",
    initials: "AT",
    status: "Blocked",
    statusVariant: "error",
  },
  {
    id: "brand-guide",
    title: "Update the brand guide",
    subtitle: "Marketing",
    meta: "3 days ago",
    initials: "MH",
    status: "Done",
    statusVariant: "success",
  },
  {
    id: "release-demo",
    title: "Prepare the release demo",
    subtitle: "Product",
    meta: "4 days ago",
    initials: "DV",
    status: "In progress",
    statusVariant: "info",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

function countLabel(count: number): string {
  return count === 1 ? "1 task" : `${count} tasks`;
}

export interface ListContainerProps {
  items?: ListContainerItem[];
  heading?: string;
  description?: string;
  actionLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function ListContainer({
  items = sampleItems,
  heading = "Sprint tasks",
  description = "Open work for the team, soonest first.",
  actionLabel = "View all tasks",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: ListContainerProps) {
  const showItems = !error && !loading && items.length > 0;

  return (
    <section className="@container moderno-block-list-container text-foreground">
      <Card.Root size="sm">
        <Card.Header>
          <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
          {description ? <Card.Description>{description}</Card.Description> : null}
        </Card.Header>

        <div className="border-y border-border">
          {error ? (
            <div className="p-4">
              <Alert.Root variant="error">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                  <Alert.Description>
                    Your tasks are safe; only this list failed to load.
                  </Alert.Description>
                  <Alert.Action>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={onRetry}
                    >
                      Try again
                    </Button>
                  </Alert.Action>
                </Alert.Content>
              </Alert.Root>
            </div>
          ) : null}

          {!error && loading ? (
            <div role="status" aria-busy="true" className="grid gap-4 p-4">
              <span className="sr-only">Loading tasks…</span>
              {placeholders.map((key) => (
                <div key={key} className="flex items-center gap-3" aria-hidden="true">
                  <Skeleton shape="circle" />
                  <div className="grid flex-1 gap-2">
                    <Skeleton shape="text" className="w-2/3" />
                    <Skeleton shape="text" className="w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!error && !loading && items.length === 0 ? (
            <div className="grid justify-items-center gap-1 px-4 py-10 text-center">
              <p className="text-ui-md font-semibold">No tasks yet</p>
              <p className="text-ui-md text-muted-foreground">
                New work for this sprint lands here.
              </p>
            </div>
          ) : null}

          {showItems ? (
            <div
              role="region"
              aria-label={heading}
              tabIndex={0}
              className="max-h-80 overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-4 py-3 @sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <Avatar.Root size="sm" className="row-span-2 self-start @sm:self-center">
                      <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                      {item.avatarUrl ? <Avatar.Image src={item.avatarUrl} alt="" /> : null}
                    </Avatar.Root>
                    <div className="grid min-w-0 gap-0.5">
                      <p className="truncate text-ui-md font-medium">{item.title}</p>
                      {item.subtitle ? (
                        <p className="truncate text-ui-sm text-muted-foreground">{item.subtitle}</p>
                      ) : null}
                    </div>
                    <div className="col-start-2 mt-2 flex flex-wrap items-center gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @sm:mt-0 @sm:flex-col @sm:items-end @sm:gap-1 @md:flex-row @md:items-center @md:gap-3">
                      {item.status ? (
                        <Badge variant={item.statusVariant ?? "neutral"} size="sm" dot>
                          {item.status}
                        </Badge>
                      ) : null}
                      {item.meta ? (
                        <span className="text-ui-xs text-muted-foreground @lg:w-24 @lg:text-right">
                          {item.meta}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <Card.Footer>
          {showItems ? (
            <p className="text-ui-sm text-muted-foreground">{countLabel(items.length)}</p>
          ) : null}
          {actionLabel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={disabled || !showItems}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          ) : null}
        </Card.Footer>
      </Card.Root>
    </section>
  );
}
