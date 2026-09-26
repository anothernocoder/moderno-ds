<script lang="ts">
  import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  interface ProductImage {
    src: string;
    alt: string;
  }

  interface Product {
    name: string;
    price: string;
    compareAtPrice?: string;
    description?: string;
    badge?: string;
    href?: string;
    image?: ProductImage;
  }

  interface Props {
    product?: Product | null;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onaddtocart?: () => void;
    onretry?: () => void;
  }

  const sampleProduct: Product = {
    name: "Stoneware mug",
    price: "€28",
    compareAtPrice: "€35",
    description: "Glazed by hand in small batches. Holds 350 ml and goes in the dishwasher.",
    badge: "Sale",
    href: "#",
  };

  let {
    product = sampleProduct,
    error,
    loading = false,
    disabled = false,
    onaddtocart,
    onretry,
  }: Props = $props();
</script>

<article class="@container moderno-block-product-card text-foreground">
  <div class="mx-auto w-full max-w-lg">
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
      <div role="status" aria-busy="true" class="relative">
        <span class="sr-only">Loading the product…</span>
        <Card.Root aria-hidden="true" class="overflow-hidden @sm:grid @sm:grid-cols-5 @sm:grid-rows-[auto_1fr_auto] @lg:grid-cols-2 @lg:grid-rows-[1fr_auto_1fr]">
          <div class="relative aspect-square bg-muted @sm:col-span-2 @sm:row-span-3 @sm:aspect-auto @lg:col-span-1 @lg:aspect-square">
            <Skeleton shape="rect" class="absolute inset-0 size-full rounded-none" />
          </div>
          <Card.Header class="gap-3 @sm:col-span-3 @lg:col-span-1 @lg:self-end">
            <Skeleton shape="text" class="w-2/3" />
            <Skeleton shape="text" />
            <Skeleton shape="text" class="w-1/2" />
          </Card.Header>
          <Card.Content class="@sm:col-span-3 @lg:col-span-1">
            <Skeleton shape="text" class="w-1/4" />
          </Card.Content>
          <Card.Footer class="@sm:col-span-3 @lg:col-span-1 @lg:self-start">
            <Skeleton shape="rect" class="h-10 w-full @sm:w-32" />
          </Card.Footer>
        </Card.Root>
      </div>
    {:else if !product}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        This product is no longer available.
      </p>
    {:else}
      <Card.Root class="overflow-hidden @sm:grid @sm:grid-cols-5 @sm:grid-rows-[auto_1fr_auto] @lg:grid-cols-2 @lg:grid-rows-[1fr_auto_1fr]">
        <div class="relative aspect-square bg-muted @sm:col-span-2 @sm:row-span-3 @sm:aspect-auto @lg:col-span-1 @lg:aspect-square">
          {#if product.image}
            <img
              src={product.image.src}
              alt={product.image.alt}
              class="absolute inset-0 size-full object-cover"
            />
          {/if}
          {#if product.badge}
            <Badge variant="solid" class="absolute start-3 top-3">{product.badge}</Badge>
          {/if}
        </div>
        <Card.Header class="gap-2 @sm:col-span-3 @lg:col-span-1 @lg:self-end">
          <Card.Title class="text-body-lg text-balance @md:text-heading-sm">
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
          </Card.Title>
          {#if product.description}
            <Card.Description class="text-pretty">{product.description}</Card.Description>
          {/if}
        </Card.Header>
        <Card.Content class="@sm:col-span-3 @lg:col-span-1">
          <p class="relative flex flex-wrap items-baseline gap-x-2">
            <span class="text-body-lg font-semibold tabular-nums">{product.price}</span>
            {#if product.compareAtPrice}
              <s class="text-ui-md text-muted-foreground tabular-nums"
                ><span class="sr-only">Was</span> {product.compareAtPrice}</s
              >
            {/if}
          </p>
        </Card.Content>
        <Card.Footer class="@sm:col-span-3 @lg:col-span-1 @lg:self-start">
          <Button
            type="button"
            class="w-full @sm:w-auto"
            {disabled}
            aria-label="Add to cart: {product.name}"
            onclick={onaddtocart}
          >
            Add to cart
          </Button>
        </Card.Footer>
      </Card.Root>
    {/if}
  </div>
</article>
