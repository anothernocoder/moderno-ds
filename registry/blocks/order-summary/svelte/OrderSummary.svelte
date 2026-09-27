<script lang="ts">
  import { Alert, Button, Card, Divider, Skeleton } from "@moderno-ui/svelte";

  interface OrderItemImage {
    src: string;
    alt: string;
  }

  interface OrderItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
    options?: string;
    href?: string;
    image?: OrderItemImage;
  }

  interface OrderTotal {
    label: string;
    amount: string;
  }

  interface Props {
    heading?: string;
    items?: OrderItem[];
    totals?: OrderTotal[];
    total?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
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

  let {
    heading = "Order summary",
    items,
    totals,
    total,
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();

  const shownItems = $derived(items ?? sampleItems);
  const shownTotals = $derived(totals ?? (items === undefined ? sampleTotals : []));
  const shownTotal = $derived(total ?? (items === undefined ? sampleTotal : undefined));
</script>

<section class="@container moderno-block-order-summary text-foreground">
  <div class="grid gap-8 px-4 py-12 @lg:py-16">
    <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Your order has not changed. Try again in a moment.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div
        role="status"
        aria-busy="true"
        class="relative grid divide-y divide-border border-y border-border"
      >
        <span class="sr-only">Loading your order…</span>
        {#each [0, 1, 2] as key (key)}
          <div aria-hidden="true" class="flex gap-4 py-5 @sm:gap-6">
            <Skeleton shape="rect" class="size-16 shrink-0 rounded-lg @sm:size-20 @md:size-24" />
            <div class="grid flex-1 content-start gap-3">
              <Skeleton shape="text" class="w-1/2" />
              <Skeleton shape="text" class="w-1/3" />
            </div>
          </div>
        {/each}
      </div>
    {:else if shownItems.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        Your order is empty.
      </p>
    {:else}
      <div class="grid gap-8 @lg:grid-cols-3 @lg:items-start @lg:gap-10">
        <ul class="divide-y divide-border border-y border-border @lg:col-span-2">
          {#each shownItems as item (item.id)}
            <li
              class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 py-5 @sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] @sm:gap-x-6"
            >
              <div
                class="relative row-span-2 size-16 overflow-hidden rounded-lg bg-muted @sm:row-span-1 @sm:size-20 @md:size-24"
              >
                {#if item.image}
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    class="absolute inset-0 size-full object-cover"
                  />
                {/if}
              </div>
              <div class="col-start-2 row-start-1 grid min-w-0 content-start gap-1 self-baseline">
                <h3 class="text-body font-medium text-balance">
                  {#if item.href}
                    <a
                      class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                      href={disabled ? undefined : item.href}
                      role={disabled ? "link" : undefined}
                      aria-disabled={disabled || undefined}>{item.name}</a
                    >
                  {:else}
                    {item.name}
                  {/if}
                </h3>
                {#if item.options}
                  <p class="text-ui-md text-muted-foreground">{item.options}</p>
                {/if}
              </div>
              <p
                class="col-start-2 row-start-2 self-baseline text-ui-md text-muted-foreground tabular-nums @sm:col-start-3 @sm:row-start-1"
              >
                Qty {item.quantity}
              </p>
              <p
                class="col-start-3 row-start-1 self-baseline text-end text-body font-medium tabular-nums @sm:col-start-4"
              >
                {item.price}
              </p>
            </li>
          {/each}
        </ul>

        {#if shownTotals.length > 0 || shownTotal}
          <Card.Root variant="muted">
            <Card.Content class="grid gap-4">
              {#if shownTotals.length > 0}
                <dl class="grid gap-3">
                  {#each shownTotals as row (row.label)}
                    <div class="flex items-baseline justify-between gap-4">
                      <dt class="text-ui-md text-muted-foreground">{row.label}</dt>
                      <dd class="text-ui-md tabular-nums">{row.amount}</dd>
                    </div>
                  {/each}
                </dl>
              {/if}
              {#if shownTotals.length > 0 && shownTotal}
                <Divider />
              {/if}
              {#if shownTotal}
                <dl class="flex items-baseline justify-between gap-4">
                  <dt class="text-body font-semibold">Total</dt>
                  <dd class="text-body-lg font-semibold tabular-nums">{shownTotal}</dd>
                </dl>
              {/if}
            </Card.Content>
          </Card.Root>
        {/if}
      </div>
    {/if}
  </div>
</section>
