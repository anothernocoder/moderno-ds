import { For, Show } from "solid-js";
import { Alert, Button, Card, Divider, Skeleton } from "@moderno-ui/solid";

export interface OrderItemImage {
  src: string;
  alt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  options?: string;
  href?: string;
  image?: OrderItemImage;
}

export interface OrderTotal {
  label: string;
  amount: string;
}

const sampleItems: OrderItem[] = [
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

const sampleTotals: OrderTotal[] = [
  { label: "Subtotal", amount: "€134" },
  { label: "Shipping", amount: "€6" },
  { label: "Taxes", amount: "€28" },
];

const sampleTotal = "€168";

export interface OrderSummaryProps {
  heading?: string;
  items?: OrderItem[];
  totals?: OrderTotal[];
  total?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function OrderSummary(props: OrderSummaryProps) {
  const heading = () => props.heading ?? "Order summary";
  const shownItems = () => props.items ?? sampleItems;
  const shownTotals = () => props.totals ?? (props.items === undefined ? sampleTotals : []);
  const shownTotal = () => props.total ?? (props.items === undefined ? sampleTotal : undefined);

  return (
    <section class="@container moderno-block-order-summary text-foreground">
      <div class="grid gap-8 px-4 py-12 @lg:py-16">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  Your order has not changed. Try again in a moment.
                </Alert.Description>
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
                <span class="sr-only">Loading your order…</span>
                <For each={[0, 1, 2]}>
                  {() => (
                    <div aria-hidden="true" class="flex gap-4 py-5 @sm:gap-6">
                      <Skeleton
                        shape="rect"
                        class="size-16 shrink-0 rounded-lg @sm:size-20 @md:size-24"
                      />
                      <div class="grid flex-1 content-start gap-3">
                        <Skeleton shape="text" class="w-1/2" />
                        <Skeleton shape="text" class="w-1/3" />
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
                  Your order is empty.
                </p>
              }
            >
              <div class="grid gap-8 @lg:grid-cols-3 @lg:items-start @lg:gap-10">
                <ul class="divide-y divide-border border-y border-border @lg:col-span-2">
                  <For each={shownItems()}>
                    {(item) => (
                      <li class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 py-5 @sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] @sm:gap-x-6">
                        <div class="relative row-span-2 size-16 overflow-hidden rounded-lg bg-muted @sm:row-span-1 @sm:size-20 @md:size-24">
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
                        <div class="col-start-2 row-start-1 grid min-w-0 content-start gap-1 self-baseline">
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
                        <p class="col-start-2 row-start-2 self-baseline text-ui-md text-muted-foreground tabular-nums @sm:col-start-3 @sm:row-start-1">
                          Qty {item.quantity}
                        </p>
                        <p class="col-start-3 row-start-1 self-baseline text-end text-body font-medium tabular-nums @sm:col-start-4">
                          {item.price}
                        </p>
                      </li>
                    )}
                  </For>
                </ul>

                <Show when={shownTotals().length > 0 || shownTotal()}>
                  <Card.Root variant="muted">
                    <Card.Content class="grid gap-4">
                      <Show when={shownTotals().length > 0}>
                        <dl class="grid gap-3">
                          <For each={shownTotals()}>
                            {(row) => (
                              <div class="flex items-baseline justify-between gap-4">
                                <dt class="text-ui-md text-muted-foreground">{row.label}</dt>
                                <dd class="text-ui-md tabular-nums">{row.amount}</dd>
                              </div>
                            )}
                          </For>
                        </dl>
                      </Show>
                      <Show when={shownTotals().length > 0 && shownTotal()}>
                        <Divider />
                      </Show>
                      <Show when={shownTotal()}>
                        <dl class="flex items-baseline justify-between gap-4">
                          <dt class="text-body font-semibold">Total</dt>
                          <dd class="text-body-lg font-semibold tabular-nums">{shownTotal()}</dd>
                        </dl>
                      </Show>
                    </Card.Content>
                  </Card.Root>
                </Show>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
