import { Alert, Button, Card, Skeleton } from "@moderno-ui/react";

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  countLabel?: string;
  imageUrl?: string;
  href?: string;
}

const sampleCategories: CategorySummary[] = [
  {
    id: "workspace",
    name: "Workspace",
    description: "Desks, chairs and lamps for the long days.",
    countLabel: "32 products",
    href: "#",
  },
  {
    id: "stationery",
    name: "Stationery",
    description: "Notebooks, pens and paper that hold up.",
    countLabel: "48 products",
    href: "#",
  },
  {
    id: "bags",
    name: "Bags",
    description: "Carry-alls for the commute and the weekend.",
    countLabel: "18 products",
    href: "#",
  },
  {
    id: "tech-accessories",
    name: "Tech accessories",
    description: "Stands, cables and cases in one place.",
    countLabel: "26 products",
    href: "#",
  },
];

const placeholders = ["first", "second", "third", "fourth"];

const linkClass =
  "rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline";

export interface CategoryPreviewProps {
  heading?: string;
  description?: string;
  allCategoriesHref?: string;
  categories?: CategorySummary[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function CategoryPreview({
  heading = "Shop by category",
  description = "Everything in the store, sorted the way you shop.",
  allCategoriesHref = "#",
  categories = sampleCategories,
  error,
  loading = false,
  disabled = false,
  onRetry,
}: CategoryPreviewProps) {
  return (
    <section className="@container moderno-block-category-preview text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div className="grid max-w-md gap-3">
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
          </div>
          {allCategoriesHref ? (
            <a
              className={`justify-self-start shrink-0 text-ui-md font-medium ${linkClass}`}
              href={disabled ? undefined : allCategoriesHref}
              role={disabled ? "link" : undefined}
              aria-disabled={disabled || undefined}
            >
              Browse all categories
            </a>
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
            className="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4 @lg:gap-8"
          >
            <span className="sr-only">Loading the categories…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} size="sm" className="overflow-hidden" aria-hidden="true">
                <Skeleton shape="rect" className="aspect-4/3 h-auto" />
                <Card.Header>
                  <Skeleton shape="text" className="w-1/2" />
                </Card.Header>
                <Card.Content className="gap-2">
                  <Skeleton shape="text" />
                  <Skeleton shape="text" className="w-2/3" />
                </Card.Content>
                <Card.Footer>
                  <Skeleton shape="text" className="w-1/3" />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No categories to show yet.
          </p>
        ) : (
          <ul className="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-4 @lg:gap-8">
            {categories.map((category) => (
              <li key={category.id} className="flex">
                <Card.Root size="sm" className="relative overflow-hidden">
                  <div className="flex aspect-4/3 items-center justify-center bg-muted">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="font-serif text-heading-lg text-muted-foreground"
                      >
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <Card.Header>
                    <Card.Title className="text-balance">
                      {category.href ? (
                        <a
                          className={`after:absolute after:inset-0 ${linkClass}`}
                          href={disabled ? undefined : category.href}
                          role={disabled ? "link" : undefined}
                          aria-disabled={disabled || undefined}
                        >
                          {category.name}
                        </a>
                      ) : (
                        category.name
                      )}
                    </Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <p className="text-pretty text-muted-foreground">{category.description}</p>
                  </Card.Content>
                  {category.countLabel ? (
                    <Card.Footer>
                      <span className="text-ui-sm text-muted-foreground">
                        {category.countLabel}
                      </span>
                    </Card.Footer>
                  ) : null}
                </Card.Root>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
