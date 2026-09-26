import { Alert, Avatar, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/react";

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  initials: string;
  avatarUrl?: string;
  status?: string;
  statusVariant?: BadgeVariant;
  meta?: string;
}

const sampleItems: ListItem[] = [
  {
    id: "ana-lopez",
    title: "Ana López",
    subtitle: "ana.lopez@example.com",
    initials: "AL",
    status: "Active",
    statusVariant: "success",
    meta: "Online now",
  },
  {
    id: "ben-okafor",
    title: "Ben Okafor",
    subtitle: "ben.okafor@example.com",
    initials: "BO",
    status: "Invited",
    statusVariant: "info",
    meta: "Sent 2 days ago",
  },
  {
    id: "chen-wei",
    title: "Chen Wei",
    subtitle: "chen.wei@example.com",
    initials: "CW",
    status: "Active",
    statusVariant: "success",
    meta: "Seen 3 hrs ago",
  },
  {
    id: "dara-singh",
    title: "Dara Singh",
    subtitle: "dara.singh@example.com",
    initials: "DS",
    status: "Away",
    statusVariant: "warning",
    meta: "Back on Monday",
  },
  {
    id: "eli-moreau",
    title: "Eli Moreau",
    subtitle: "eli.moreau@example.com",
    initials: "EM",
    status: "Suspended",
    statusVariant: "error",
    meta: "Since last week",
  },
];

const placeholders = ["first", "second", "third"];

export interface ListProps {
  items?: ListItem[];
  heading?: string;
  description?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onInvite?: () => void;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  onRetry?: () => void;
}

export function List({
  items = sampleItems,
  heading = "Team members",
  description = "People who can open and edit this workspace.",
  error,
  loading = false,
  disabled = false,
  onInvite,
  onEdit,
  onRemove,
  onRetry,
}: ListProps) {
  const inert = loading || disabled;
  const showRows = !error && !loading && items.length > 0;

  return (
    <section className="@container moderno-block-list text-foreground">
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
              <Alert.Description>
                Nothing was changed. Your team is still in place.
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
        ) : null}

        {loading ? (
          <Card.Root size="sm">
            <div role="status" aria-busy="true">
              <span className="sr-only">Loading team members…</span>
              <div className="divide-y divide-border" aria-hidden="true">
                {placeholders.map((key) => (
                  <div key={key} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton shape="circle" />
                    <div className="grid flex-1 gap-2">
                      <Skeleton shape="text" className="w-1/2" />
                      <Skeleton shape="text" className="w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card.Root>
        ) : null}

        {!error && !loading && items.length === 0 ? (
          <Card.Root>
            <Card.Header className="items-center text-center">
              <Card.Title>No members yet</Card.Title>
              <Card.Description>People you invite show up here, one row each.</Card.Description>
            </Card.Header>
          </Card.Root>
        ) : null}

        {showRows ? (
          <Card.Root size="sm">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 @sm:grid-cols-[auto_minmax(0,1fr)_auto] @md:grid-cols-[auto_minmax(0,1fr)_auto_auto] @md:gap-x-4"
                >
                  <Avatar.Root>
                    <Avatar.Fallback>{item.initials}</Avatar.Fallback>
                    {item.avatarUrl ? <Avatar.Image src={item.avatarUrl} alt="" /> : null}
                  </Avatar.Root>
                  <div className="grid min-w-0 gap-0.5">
                    <p className="truncate text-ui-md font-medium">{item.title}</p>
                    {item.subtitle ? (
                      <p className="truncate text-ui-sm text-muted-foreground">{item.subtitle}</p>
                    ) : null}
                  </div>
                  {item.status || item.meta ? (
                    <div className="col-start-2 flex flex-wrap items-center gap-2 @md:col-start-3 @md:row-start-1 @md:flex-col @md:items-end @md:gap-1 @lg:flex-row @lg:items-center @lg:gap-4">
                      {item.status ? (
                        <Badge variant={item.statusVariant ?? "neutral"} size="sm" dot>
                          {item.status}
                        </Badge>
                      ) : null}
                      {item.meta ? (
                        <span className="text-ui-xs text-muted-foreground @lg:w-28 @lg:text-right">
                          {item.meta}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="col-start-2 flex gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @md:col-start-4 @md:row-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      aria-label={`Edit ${item.title}`}
                      onClick={() => onEdit?.(item.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      aria-label={`Remove ${item.title}`}
                      onClick={() => onRemove?.(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card.Root>
        ) : null}
      </div>
    </section>
  );
}
