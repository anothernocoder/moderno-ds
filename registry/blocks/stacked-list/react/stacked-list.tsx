import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

export type StackedListStatus = "neutral" | "info" | "success" | "warning" | "error";

export interface StackedListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  image?: string;
  status?: string;
  statusVariant?: StackedListStatus;
  meta?: string;
}

const sampleItems: StackedListItem[] = [
  {
    id: "leslie",
    title: "Leslie Alexander",
    subtitle: "leslie.alexander@example.com",
    initials: "LA",
    status: "Active",
    statusVariant: "success",
    meta: "Last seen 3 hrs ago",
  },
  {
    id: "michael",
    title: "Michael Foster",
    subtitle: "michael.foster@example.com",
    initials: "MF",
    status: "Invited",
    statusVariant: "info",
    meta: "Invited 2 days ago",
  },
  {
    id: "dries",
    title: "Dries Vincent",
    subtitle: "dries.vincent@example.com",
    initials: "DV",
    status: "Away",
    statusVariant: "warning",
    meta: "Last seen yesterday",
  },
  {
    id: "lindsay",
    title: "Lindsay Walton",
    subtitle: "lindsay.walton@example.com",
    initials: "LW",
    status: "Suspended",
    statusVariant: "error",
    meta: "Suspended last week",
  },
  {
    id: "courtney",
    title: "Courtney Henry",
    subtitle: "courtney.henry@example.com",
    initials: "CH",
    status: "Guest",
    statusVariant: "neutral",
    meta: "Last seen 2 weeks ago",
  },
];

const placeholders = ["first", "second", "third"];

export interface StackedListProps {
  items?: StackedListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onView?: (id: string) => void;
  onInvite?: () => void;
  onRetry?: () => void;
}

export function StackedList({
  items = sampleItems,
  heading = "Team members",
  description = "Everyone with access to this workspace.",
  error,
  loading = false,
  disabled = false,
  onView,
  onInvite,
  onRetry,
}: StackedListProps) {
  const inert = loading || disabled;
  const showRows = !loading && items.length > 0;

  return (
    <section className="@container moderno-block-stacked-list text-foreground">
      <div className="grid gap-4">
        <div className="grid gap-3 @sm:flex @sm:items-center @sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-body-lg font-semibold @md:text-heading-sm">{heading}</h2>
            {description ? <p className="text-ui-md text-muted-foreground">{description}</p> : null}
          </div>
          <Button type="button" size="sm" disabled={inert} onClick={onInvite}>
            Invite member
          </Button>
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Nothing was changed. Your team is still saved.</Alert.Description>
              <Alert.Action>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              </Alert.Action>
            </Alert.Content>
          </Alert.Root>
        ) : (
          <Card.Root>
            <Card.Content className="gap-0 p-4 @sm:p-6">
              {loading ? (
                <div role="status" aria-busy="true" className="grid">
                  {placeholders.map((key) => (
                    <div
                      key={key}
                      aria-hidden="true"
                      className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <Skeleton shape="circle" className="size-10 shrink-0" />
                      <div className="grid flex-1 gap-2">
                        <Skeleton shape="text" className="w-1/3" />
                        <Skeleton shape="text" className="w-2/3" />
                      </div>
                    </div>
                  ))}
                  <span className="sr-only">Loading team members…</span>
                </div>
              ) : null}

              {!loading && items.length === 0 ? (
                <div className="grid gap-1 py-4 text-center">
                  <p className="text-ui-md font-medium">No members yet</p>
                  <p className="text-ui-md text-muted-foreground">
                    People you invite show up here.
                  </p>
                </div>
              ) : null}

              {showRows ? (
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="grid justify-items-start gap-3 py-4 first:pt-0 last:pb-0 @sm:flex @sm:items-center @sm:gap-4"
                    >
                      <div className="flex w-full min-w-0 flex-1 items-start gap-3 @md:items-center">
                        <Avatar.Root>
                          <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                          {item.image ? <Avatar.Image src={item.image} alt="" /> : null}
                        </Avatar.Root>
                        <div className="grid min-w-0 flex-1 gap-2 @md:flex @md:items-center @md:justify-between @md:gap-4">
                          <div className="grid min-w-0 gap-1">
                            <p className="truncate text-ui-md font-medium">{item.title}</p>
                            {item.subtitle ? (
                              <p className="truncate text-ui-md text-muted-foreground">
                                {item.subtitle}
                              </p>
                            ) : null}
                          </div>
                          {item.status || item.meta ? (
                            <div className="flex flex-wrap items-center gap-2 @md:shrink-0 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-3">
                              {item.status ? (
                                <Badge variant={item.statusVariant ?? "neutral"} dot>
                                  {item.status}
                                </Badge>
                              ) : null}
                              {item.meta ? (
                                <span className="text-ui-sm text-muted-foreground">
                                  {item.meta}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={inert}
                        aria-label={`View ${item.title}`}
                        onClick={() => onView?.(item.id)}
                      >
                        View
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card.Content>
          </Card.Root>
        )}
      </div>
    </section>
  );
}
