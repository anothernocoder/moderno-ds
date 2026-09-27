import { Alert, Badge, Button, Pagination, Skeleton } from "@moderno-ui/react";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  price: string;
  compareAtPrice?: string;
  badge?: string;
  href?: string;
  image?: ProductImage;
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

export interface ProductListProps {
  heading?: string;
  description?: string;
  products?: ProductSummary[];
  total?: number;
  pageSize?: number;
  page?: number;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
}

export function ProductList({
  heading = "The collection",
  description = "Stoneware, glass and linen for the table, made in small batches.",
  products,
  total,
  pageSize = 12,
  page,
  error,
  loading = false,
  disabled = false,
  onPageChange,
  onRetry,
}: ProductListProps) {
  const shownProducts = products ?? sampleProducts;
  const count = total ?? (products === undefined ? sampleTotal : products.length);
  const placeholders = Array.from({ length: pageSize }, (_, index) => index);

  return (
    <section className="@container moderno-block-product-list text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div className="grid max-w-md gap-3">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
          </div>
          {!error && !loading && shownProducts.length > 0 ? (
            <p className="shrink-0 text-ui-md text-muted-foreground tabular-nums">
              {count === 1 ? "1 product" : `${count} products`}
            </p>
          ) : null}
        </div>

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
          <div
            role="status"
            aria-busy="true"
            className="relative grid grid-cols-2 gap-x-4 gap-y-8 @md:grid-cols-3 @lg:grid-cols-4 @lg:gap-x-6"
          >
            <span className="sr-only">Loading the products…</span>
            {placeholders.map((key) => (
              <div key={key} aria-hidden="true" className="grid content-start gap-3">
                <Skeleton shape="rect" className="aspect-square h-auto w-full rounded-lg" />
                <Skeleton shape="text" className="w-3/4" />
                <Skeleton shape="text" className="w-1/3" />
              </div>
            ))}
          </div>
        ) : shownProducts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No products match yet.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 @md:grid-cols-3 @lg:grid-cols-4 @lg:gap-x-6">
            {shownProducts.map((product) => (
              <li key={product.id} className="grid content-start gap-3">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  {product.image ? (
                    <img
                      src={product.image.src}
                      alt={product.image.alt}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : null}
                  {product.badge ? (
                    <Badge variant="solid" size="sm" className="absolute start-2 top-2">
                      {product.badge}
                    </Badge>
                  ) : null}
                </div>
                <div className="grid gap-1">
                  <h3 className="text-body font-medium text-balance">
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
                  </h3>
                  <p className="relative flex flex-wrap items-baseline gap-x-2 text-ui-md tabular-nums">
                    <span>{product.price}</span>
                    {product.compareAtPrice ? (
                      <s className="text-muted-foreground">
                        <span className="sr-only">Was</span> {product.compareAtPrice}
                      </s>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!error && shownProducts.length > 0 && count > pageSize ? (
          <Pagination.Root
            className="justify-self-center"
            count={count}
            pageSize={pageSize}
            page={page}
            onPageChange={(details) => onPageChange?.(details.page)}
          >
            <Pagination.PrevTrigger disabled={disabled || undefined}>‹</Pagination.PrevTrigger>
            <Pagination.Context>
              {(pagination) =>
                pagination.pages.map((item, index) =>
                  item.type === "page" ? (
                    <Pagination.Item key={index} {...item} disabled={disabled || undefined}>
                      {item.value}
                    </Pagination.Item>
                  ) : (
                    <Pagination.Ellipsis key={index} index={index}>
                      …
                    </Pagination.Ellipsis>
                  ),
                )
              }
            </Pagination.Context>
            <Pagination.NextTrigger disabled={disabled || undefined}>›</Pagination.NextTrigger>
          </Pagination.Root>
        ) : null}
      </div>
    </section>
  );
}
