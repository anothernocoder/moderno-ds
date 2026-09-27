import { Alert, Button, Card, NumberInput, Skeleton } from "@moderno-ui/react";

export interface CartItemImage {
  src: string;
  alt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  maxQuantity?: number;
  options?: string;
  href?: string;
  image?: CartItemImage;
}

const sampleItems: CartItem[] = [
  {
    id: "stoneware-mug",
    name: "Stoneware mug",
    price: "€56",
    quantity: 2,
    options: "Sage · 350 ml",
    href: "#",
  },
  {
    id: "serving-bowl",
    name: "Serving bowl",
    price: "€46",
    quantity: 1,
    options: "Oat · Large",
    href: "#",
  },
  { id: "bud-vase", name: "Bud vase", price: "€32", quantity: 1, options: "Charcoal", href: "#" },
];

const sampleSubtotal = "€134";

export interface ShoppingCartProps {
  heading?: string;
  items?: CartItem[];
  subtotal?: string;
  note?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  onCheckout?: () => void;
  onRetry?: () => void;
}

export function ShoppingCart({
  heading = "Shopping cart",
  items,
  subtotal,
  note = "Shipping and taxes are added at checkout.",
  error,
  loading = false,
  disabled = false,
  onQuantityChange,
  onRemove,
  onCheckout,
  onRetry,
}: ShoppingCartProps) {
  const shownItems = items ?? sampleItems;
  const shownSubtotal = subtotal ?? (items === undefined ? sampleSubtotal : undefined);

  return (
    <section className="@container moderno-block-shopping-cart text-foreground">
      <div className="grid gap-8 px-4 py-12 @lg:py-16">
        <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>

        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Your cart is safe. Try again in a moment.</Alert.Description>
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
          <div
            role="status"
            aria-busy="true"
            className="relative grid divide-y divide-border border-y border-border"
          >
            <span className="sr-only">Loading your cart…</span>
            {[0, 1, 2].map((key) => (
              <div key={key} aria-hidden="true" className="flex gap-4 py-6 @sm:gap-6">
                <Skeleton
                  shape="rect"
                  className="size-20 shrink-0 rounded-lg @sm:size-24 @md:size-32"
                />
                <div className="grid flex-1 content-start gap-3">
                  <Skeleton shape="text" className="w-1/2" />
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="rect" className="h-7 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : shownItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            Your cart is empty.
          </p>
        ) : (
          <div className="grid gap-8 @lg:grid-cols-3 @lg:items-start @lg:gap-10">
            <ul className="divide-y divide-border border-y border-border @lg:col-span-2">
              {shownItems.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-4 py-6 @sm:gap-x-6"
                >
                  <div className="relative size-20 overflow-hidden rounded-lg bg-muted @sm:row-span-2 @sm:size-24 @md:size-32">
                    {item.image ? (
                      <img
                        src={item.image.src}
                        alt={item.image.alt}
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="grid min-w-0 content-start gap-1">
                    <h3 className="text-body font-medium text-balance">
                      {item.href ? (
                        <a
                          className="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                          href={disabled ? undefined : item.href}
                          role={disabled ? "link" : undefined}
                          aria-disabled={disabled || undefined}
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </h3>
                    {item.options ? (
                      <p className="text-ui-md text-muted-foreground">{item.options}</p>
                    ) : null}
                  </div>
                  <p className="text-end text-body font-medium tabular-nums">{item.price}</p>
                  <div className="col-span-3 flex items-center justify-between gap-3 @sm:col-span-2 @sm:col-start-2 @sm:justify-start">
                    <NumberInput.Root
                      size="sm"
                      className="w-28"
                      defaultValue={String(item.quantity)}
                      min={1}
                      max={item.maxQuantity ?? 99}
                      disabled={disabled}
                      onValueChange={(details) => {
                        if (Number.isFinite(details.valueAsNumber)) {
                          onQuantityChange?.(item.id, details.valueAsNumber);
                        }
                      }}
                    >
                      <NumberInput.Label className="sr-only">
                        Quantity, {item.name}
                      </NumberInput.Label>
                      <NumberInput.Control>
                        <NumberInput.Input />
                        <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
                        <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
                      </NumberInput.Control>
                    </NumberInput.Root>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      aria-label={`Remove ${item.name}`}
                      onClick={() => onRemove?.(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <Card.Root variant="muted">
              <Card.Header>
                <Card.Title>Order summary</Card.Title>
              </Card.Header>
              <Card.Content className="grid gap-3">
                {shownSubtotal ? (
                  <dl className="flex items-baseline justify-between gap-4">
                    <dt className="text-ui-md text-muted-foreground">Subtotal</dt>
                    <dd className="text-body-lg font-semibold tabular-nums">{shownSubtotal}</dd>
                  </dl>
                ) : null}
                {note ? <p className="text-ui-sm text-muted-foreground">{note}</p> : null}
              </Card.Content>
              <Card.Footer>
                <Button type="button" className="w-full" disabled={disabled} onClick={onCheckout}>
                  Checkout
                </Button>
              </Card.Footer>
            </Card.Root>
          </div>
        )}
      </div>
    </section>
  );
}
