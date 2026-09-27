import { For, Show } from "solid-js";
import { Alert, Button, Card, NumberInput, Skeleton } from "@moderno-ui/solid";

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

export function ShoppingCart(props: ShoppingCartProps) {
  const heading = () => props.heading ?? "Shopping cart";
  const note = () => props.note ?? "Shipping and taxes are added at checkout.";
  const shownItems = () => props.items ?? sampleItems;
  const shownSubtotal = () =>
    props.subtotal ?? (props.items === undefined ? sampleSubtotal : undefined);

  return (
    <section class="@container moderno-block-shopping-cart text-foreground">
      <div class="grid gap-8 px-4 py-12 @lg:py-16">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>Your cart is safe. Try again in a moment.</Alert.Description>
                <Alert.Action>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={props.disabled}
                    onClick={props.onRetry}
                  >
                    Try again
                  </Button>
                </Alert.Action>
              </Alert.Content>
            </Alert.Root>
          }
        >
          <Show
            when={!props.loading}
            fallback={
              <div
                role="status"
                aria-busy="true"
                class="relative grid divide-y divide-border border-y border-border"
              >
                <span class="sr-only">Loading your cart…</span>
                <For each={[0, 1, 2]}>
                  {() => (
                    <div aria-hidden="true" class="flex gap-4 py-6 @sm:gap-6">
                      <Skeleton
                        shape="rect"
                        class="size-20 shrink-0 rounded-lg @sm:size-24 @md:size-32"
                      />
                      <div class="grid flex-1 content-start gap-3">
                        <Skeleton shape="text" class="w-1/2" />
                        <Skeleton shape="text" class="w-1/3" />
                        <Skeleton shape="rect" class="h-7 w-28" />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <Show
              when={shownItems().length > 0}
              fallback={
                <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  Your cart is empty.
                </p>
              }
            >
              <div class="grid gap-8 @lg:grid-cols-3 @lg:items-start @lg:gap-10">
                <ul class="divide-y divide-border border-y border-border @lg:col-span-2">
                  <For each={shownItems()}>
                    {(item) => (
                      <li class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-4 py-6 @sm:gap-x-6">
                        <div class="relative size-20 overflow-hidden rounded-lg bg-muted @sm:row-span-2 @sm:size-24 @md:size-32">
                          <Show when={item.image}>
                            {(image) => (
                              <img
                                src={image().src}
                                alt={image().alt}
                                class="absolute inset-0 size-full object-cover"
                              />
                            )}
                          </Show>
                        </div>
                        <div class="grid min-w-0 content-start gap-1">
                          <h3 class="text-body font-medium text-balance">
                            <Show when={item.href} fallback={item.name}>
                              <a
                                class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                                href={props.disabled ? undefined : item.href}
                                role={props.disabled ? "link" : undefined}
                                aria-disabled={props.disabled || undefined}
                              >
                                {item.name}
                              </a>
                            </Show>
                          </h3>
                          <Show when={item.options}>
                            <p class="text-ui-md text-muted-foreground">{item.options}</p>
                          </Show>
                        </div>
                        <p class="text-end text-body font-medium tabular-nums">{item.price}</p>
                        <div class="col-span-3 flex items-center justify-between gap-3 @sm:col-span-2 @sm:col-start-2 @sm:justify-start">
                          <NumberInput.Root
                            size="sm"
                            class="w-28"
                            defaultValue={String(item.quantity)}
                            min={1}
                            max={item.maxQuantity ?? 99}
                            disabled={props.disabled}
                            onValueChange={(details) => {
                              if (Number.isFinite(details.valueAsNumber)) {
                                props.onQuantityChange?.(item.id, details.valueAsNumber);
                              }
                            }}
                          >
                            <NumberInput.Label class="sr-only">
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
                            disabled={props.disabled}
                            aria-label={`Remove ${item.name}`}
                            onClick={() => props.onRemove?.(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>

                <Card.Root variant="muted">
                  <Card.Header>
                    <Card.Title>Order summary</Card.Title>
                  </Card.Header>
                  <Card.Content class="grid gap-3">
                    <Show when={shownSubtotal()}>
                      <dl class="flex items-baseline justify-between gap-4">
                        <dt class="text-ui-md text-muted-foreground">Subtotal</dt>
                        <dd class="text-body-lg font-semibold tabular-nums">{shownSubtotal()}</dd>
                      </dl>
                    </Show>
                    <Show when={note()}>
                      <p class="text-ui-sm text-muted-foreground">{note()}</p>
                    </Show>
                  </Card.Content>
                  <Card.Footer>
                    <Button
                      type="button"
                      class="w-full"
                      disabled={props.disabled}
                      onClick={props.onCheckout}
                    >
                      Checkout
                    </Button>
                  </Card.Footer>
                </Card.Root>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
