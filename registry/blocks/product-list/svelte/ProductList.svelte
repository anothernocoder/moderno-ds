<script lang="ts">
  import { Alert, Badge, Button, Pagination, Skeleton } from "@moderno-ui/svelte";

  interface ProductImage {
    src: string;
    alt: string;
  }

  interface ProductSummary {
    id: string;
    name: string;
    price: string;
    compareAtPrice?: string;
    badge?: string;
    href?: string;
    image?: ProductImage;
  }

  interface Props {
    heading?: string;
    description?: string;
    products?: ProductSummary[];
    total?: number;
    pageSize?: number;
    page?: number;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onpagechange?: (page: number) => void;
    onretry?: () => void;
  }

  const sampleProducts: ProductSummary[] = [
    {
      id: "stoneware-mug",
      name: "Stoneware mug",
      price: "€28",
      compareAtPrice: "€35",
      badge: "Sale",
      href: "#",
    },
    { id: "serving-bowl", name: "Serving bowl", price: "€46", href: "#" },
    { id: "bud-vase", name: "Bud vase", price: "€32", badge: "New", href: "#" },
    { id: "dinner-plate", name: "Dinner plate", price: "€24", href: "#" },
    { id: "espresso-cup", name: "Espresso cup", price: "€18", href: "#" },
    { id: "pasta-bowl", name: "Pasta bowl", price: "€30", href: "#" },
    { id: "tall-vase", name: "Tall vase", price: "€54", href: "#" },
    {
      id: "side-plate",
      name: "Side plate",
      price: "€16",
      compareAtPrice: "€19",
      badge: "Sale",
      href: "#",
    },
    { id: "tea-mug", name: "Tea mug", price: "€26", href: "#" },
    { id: "salad-bowl", name: "Salad bowl", price: "€58", href: "#" },
    { id: "stem-vase", name: "Stem vase", price: "€38", badge: "New", href: "#" },
    { id: "serving-platter", name: "Serving platter", price: "€64" },
  ];

  const sampleTotal = 48;

  let {
    heading = "The collection",
    description = "Stoneware, glass and linen for the table, made in small batches.",
    products,
    total,
    pageSize = 12,
    page,
    error,
    loading = false,
    disabled = false,
    onpagechange,
    onretry,
  }: Props = $props();

  const shownProducts = $derived(products ?? sampleProducts);
  const count = $derived(total ?? (products === undefined ? sampleTotal : products.length));
  const placeholders = $derived(Array.from({ length: pageSize }, (_, index) => index));
</script>

<section class="@container moderno-block-product-list text-foreground">
  <div class="grid gap-10 px-4 py-12 @lg:py-16">
    <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
      <div class="grid max-w-md gap-3">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if description}
          <p class="text-body text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if !error && !loading && shownProducts.length > 0}
        <p class="shrink-0 text-ui-md text-muted-foreground tabular-nums">
          {count === 1 ? "1 product" : `${count} products`}
        </p>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>The rest of the page still works. Try again in a moment.</Alert.Description>
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
        class="relative grid grid-cols-2 gap-x-4 gap-y-8 @md:grid-cols-3 @lg:grid-cols-4 @lg:gap-x-6"
      >
        <span class="sr-only">Loading the products…</span>
        {#each placeholders as key (key)}
          <div aria-hidden="true" class="grid content-start gap-3">
            <Skeleton shape="rect" class="aspect-square h-auto w-full rounded-lg" />
            <Skeleton shape="text" class="w-3/4" />
            <Skeleton shape="text" class="w-1/3" />
          </div>
        {/each}
      </div>
    {:else if shownProducts.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No products match yet.
      </p>
    {:else}
      <ul class="grid grid-cols-2 gap-x-4 gap-y-8 @md:grid-cols-3 @lg:grid-cols-4 @lg:gap-x-6">
        {#each shownProducts as product (product.id)}
          <li class="grid content-start gap-3">
            <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {#if product.image}
                <img
                  src={product.image.src}
                  alt={product.image.alt}
                  class="absolute inset-0 size-full object-cover"
                />
              {/if}
              {#if product.badge}
                <Badge variant="solid" size="sm" class="absolute start-2 top-2">{product.badge}</Badge>
              {/if}
            </div>
            <div class="grid gap-1">
              <h3 class="text-body font-medium text-balance">
                {#if product.href}
                  <a
                    class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                    href={disabled ? undefined : product.href}
                    role={disabled ? "link" : undefined}
                    aria-disabled={disabled || undefined}>{product.name}</a
                  >
                {:else}
                  {product.name}
                {/if}
              </h3>
              <p class="relative flex flex-wrap items-baseline gap-x-2 text-ui-md tabular-nums">
                <span>{product.price}</span>
                {#if product.compareAtPrice}
                  <s class="text-muted-foreground"><span class="sr-only">Was</span> {product.compareAtPrice}</s>
                {/if}
              </p>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    {#if !error && shownProducts.length > 0 && count > pageSize}
      <Pagination.Root
        class="justify-self-center"
        {count}
        {pageSize}
        {page}
        onPageChange={(details) => onpagechange?.(details.page)}
      >
        <Pagination.PrevTrigger disabled={disabled || undefined}>‹</Pagination.PrevTrigger>
        <Pagination.Context>
          {#snippet render(pagination)}
            {#each pagination().pages as item, index (index)}
              {#if item.type === "page"}
                <Pagination.Item {...item} disabled={disabled || undefined}>{item.value}</Pagination.Item>
              {:else}
                <Pagination.Ellipsis {index}>…</Pagination.Ellipsis>
              {/if}
            {/each}
          {/snippet}
        </Pagination.Context>
        <Pagination.NextTrigger disabled={disabled || undefined}>›</Pagination.NextTrigger>
      </Pagination.Root>
    {/if}
  </div>
</section>
