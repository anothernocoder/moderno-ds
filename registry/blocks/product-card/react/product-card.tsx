import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  name: string;
  price: string;
  compareAtPrice?: string;
  description?: string;
  badge?: string;
  href?: string;
  image?: ProductImage;
}

const sampleProduct: Product = {
  name: "Stoneware mug",
  price: "€28",
  compareAtPrice: "€35",
  description: "Glazed by hand in small batches. Holds 350 ml and goes in the dishwasher.",
  badge: "Sale",
  href: "#",
};

export interface ProductCardProps {
  product?: Product | null;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAddToCart?: () => void;
  onRetry?: () => void;
}

export function ProductCard({
  product = sampleProduct,
  error,
  loading = false,
  disabled = false,
  onAddToCart,
  onRetry,
}: ProductCardProps) {
  return (
    <article className="@container moderno-block-product-card text-foreground">
      <div className="mx-auto w-full max-w-lg">
        {error ? (
          <Alert.Root variant="error">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                The rest of the page still works. Try again in a moment.
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
        ) : loading ? (
          <div role="status" aria-busy="true" className="relative">
            <span className="sr-only">Loading the product…</span>
            <Card.Root
              aria-hidden="true"
              className="overflow-hidden @sm:grid @sm:grid-cols-5 @sm:grid-rows-[auto_1fr_auto] @lg:grid-cols-2 @lg:grid-rows-[1fr_auto_1fr]"
            >
              <div className="relative aspect-square bg-muted @sm:col-span-2 @sm:row-span-3 @sm:aspect-auto @lg:col-span-1 @lg:aspect-square">
                <Skeleton shape="rect" className="absolute inset-0 size-full rounded-none" />
              </div>
              <Card.Header className="gap-3 @sm:col-span-3 @lg:col-span-1 @lg:self-end">
                <Skeleton shape="text" className="w-2/3" />
                <Skeleton shape="text" />
                <Skeleton shape="text" className="w-1/2" />
              </Card.Header>
              <Card.Content className="@sm:col-span-3 @lg:col-span-1">
                <Skeleton shape="text" className="w-1/4" />
              </Card.Content>
              <Card.Footer className="@sm:col-span-3 @lg:col-span-1 @lg:self-start">
                <Skeleton shape="rect" className="h-10 w-full @sm:w-32" />
              </Card.Footer>
            </Card.Root>
          </div>
        ) : !product ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            This product is no longer available.
          </p>
        ) : (
          <Card.Root className="overflow-hidden @sm:grid @sm:grid-cols-5 @sm:grid-rows-[auto_1fr_auto] @lg:grid-cols-2 @lg:grid-rows-[1fr_auto_1fr]">
            <div className="relative aspect-square bg-muted @sm:col-span-2 @sm:row-span-3 @sm:aspect-auto @lg:col-span-1 @lg:aspect-square">
              {product.image ? (
                <img
                  src={product.image.src}
                  alt={product.image.alt}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
              {product.badge ? (
                <Badge variant="solid" className="absolute start-3 top-3">
                  {product.badge}
                </Badge>
              ) : null}
            </div>
            <Card.Header className="gap-2 @sm:col-span-3 @lg:col-span-1 @lg:self-end">
              <Card.Title className="text-body-lg text-balance @md:text-heading-sm">
                {product.href ? (
                  <a
                    className="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                    href={disabled ? undefined : product.href}
                    role={disabled ? "link" : undefined}
                    aria-disabled={disabled || undefined}
                  >
                    {product.name}
                  </a>
                ) : (
                  product.name
                )}
              </Card.Title>
              {product.description ? (
                <Card.Description className="text-pretty">{product.description}</Card.Description>
              ) : null}
            </Card.Header>
            <Card.Content className="@sm:col-span-3 @lg:col-span-1">
              <p className="relative flex flex-wrap items-baseline gap-x-2">
                <span className="text-body-lg font-semibold tabular-nums">{product.price}</span>
                {product.compareAtPrice ? (
                  <s className="text-ui-md text-muted-foreground tabular-nums">
                    <span className="sr-only">Was</span> {product.compareAtPrice}
                  </s>
                ) : null}
              </p>
            </Card.Content>
            <Card.Footer className="@sm:col-span-3 @lg:col-span-1 @lg:self-start">
              <Button
                type="button"
                className="w-full @sm:w-auto"
                disabled={disabled}
                aria-label={`Add to cart: ${product.name}`}
                onClick={onAddToCart}
              >
                Add to cart
              </Button>
            </Card.Footer>
          </Card.Root>
        )}
      </div>
    </article>
  );
}
