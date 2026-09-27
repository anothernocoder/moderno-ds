import { Alert, Badge, Button, Card, Skeleton, type BadgeVariant } from "@moderno-ui/react";

export interface OrderHistoryItemImage {
  src: string;
  alt: string;
}

export interface OrderHistoryItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: OrderHistoryItemImage;
}

export interface OrderHistoryOrder {
  id: string;
  number: string;
  date: string;
  total: string;
  status: string;
  statusVariant?: BadgeVariant;
  items: OrderHistoryItem[];
}

const sampleOrders: OrderHistoryOrder[] = [
  {
    id: "wu88191111",
    number: "WU88191111",
    date: "6 Jan 2026",
    total: "€134",
    status: "Shipped",
    statusVariant: "info",
    items: [
      { id: "stoneware-mug", name: "Stoneware mug", price: "€56", quantity: 2 },
      { id: "serving-bowl", name: "Serving bowl", price: "€46", quantity: 1 },
      { id: "bud-vase", name: "Bud vase", price: "€32", quantity: 1 },
    ],
  },
  {
    id: "wu88191009",
    number: "WU88191009",
    date: "18 Dec 2025",
    total: "€92",
    status: "Delivered",
    statusVariant: "success",
    items: [{ id: "serving-bowl", name: "Serving bowl", price: "€92", quantity: 2 }],
  },
  {
    id: "wu88190874",
    number: "WU88190874",
    date: "2 Nov 2025",
    total: "€32",
    status: "Cancelled",
    statusVariant: "error",
    items: [{ id: "bud-vase", name: "Bud vase", price: "€32", quantity: 1 }],
  },
];

export interface OrderHistoryProps {
  heading?: string;
  description?: string;
  orders?: OrderHistoryOrder[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onView?: (id: string) => void;
  onRetry?: () => void;
}

export function OrderHistory({
  heading = "Order history",
  description = "Check the status of your recent orders.",
  orders,
  error,
  loading = false,
  disabled = false,
  onView,
  onRetry,
}: OrderHistoryProps) {
  const shownOrders = orders ?? sampleOrders;

  return (
    <section className="@container moderno-block-order-history text-foreground">
      <div className="grid gap-8 px-4 py-12 @lg:py-16">
        <div className="grid gap-2">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? (
            <p className="text-body text-pretty text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Your orders are safe. Try again in a moment.</Alert.Description>
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
        ) : loading ? (
          <div role="status" aria-busy="true" className="grid gap-6 @lg:gap-8">
            <span className="sr-only">Loading your orders…</span>
            {[0, 1].map((key) => (
              <Card.Root key={key} size="sm" aria-hidden="true">
                <Card.Header className="gap-3 border-b border-border">
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="text" className="w-1/2" />
                </Card.Header>
                <div className="flex gap-4 p-4">
                  <Skeleton shape="rect" className="size-16 shrink-0 rounded-lg @sm:size-20" />
                  <div className="grid flex-1 content-start gap-3">
                    <Skeleton shape="text" className="w-1/2" />
                    <Skeleton shape="text" className="w-1/4" />
                  </div>
                </div>
              </Card.Root>
            ))}
          </div>
        ) : shownOrders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            You have not placed any orders yet.
          </p>
        ) : (
          <ul className="grid gap-6 @lg:gap-8">
            {shownOrders.map((order) => (
              <li key={order.id}>
                <Card.Root size="sm">
                  <Card.Header className="grid gap-4 border-b border-border @sm:grid-cols-[minmax(0,1fr)_auto] @sm:items-center @sm:gap-x-6">
                    <div className="grid min-w-0 gap-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-body font-semibold">Order {order.number}</h3>
                        <Badge variant={order.statusVariant ?? "neutral"} size="sm" dot>
                          {order.status}
                        </Badge>
                      </div>
                      <dl className="grid gap-1 @sm:flex @sm:gap-x-8">
                        <div className="flex items-baseline justify-between gap-4 @sm:grid @sm:justify-start @sm:gap-0.5">
                          <dt className="text-ui-md text-muted-foreground">Date placed</dt>
                          <dd className="text-ui-md">{order.date}</dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-4 @sm:grid @sm:justify-start @sm:gap-0.5">
                          <dt className="text-ui-md text-muted-foreground">Total</dt>
                          <dd className="text-ui-md font-medium tabular-nums">{order.total}</dd>
                        </div>
                      </dl>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full @sm:w-auto"
                      aria-label={`View order ${order.number}`}
                      disabled={disabled}
                      onClick={() => onView?.(order.id)}
                    >
                      View order
                    </Button>
                  </Card.Header>
                  <ul className="divide-y divide-border px-4">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 py-4 @md:grid-cols-[auto_minmax(0,1fr)_auto_auto] @md:gap-x-6"
                      >
                        <div className="relative row-span-2 size-16 overflow-hidden rounded-lg bg-muted @sm:size-20 @md:row-span-1">
                          {item.image ? (
                            <img
                              src={item.image.src}
                              alt={item.image.alt}
                              className="absolute inset-0 size-full object-cover"
                            />
                          ) : null}
                        </div>
                        <p className="col-start-2 row-start-1 min-w-0 self-baseline text-body font-medium text-balance">
                          {item.name}
                        </p>
                        <p className="col-start-2 row-start-2 self-baseline text-ui-md text-muted-foreground tabular-nums @md:col-start-3 @md:row-start-1">
                          Qty {item.quantity}
                        </p>
                        <p className="col-start-3 row-start-1 self-baseline text-end text-body font-medium tabular-nums @md:col-start-4">
                          {item.price}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card.Root>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
