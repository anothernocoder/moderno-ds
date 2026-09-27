import { Alert, Button, Chip, Skeleton } from "@moderno-ui/react";

export interface BlogCategory {
  id: string;
  label: string;
  href: string;
}

const sampleCategories: BlogCategory[] = [
  { id: "all", label: "All posts", href: "#" },
  { id: "product", label: "Product", href: "#" },
  { id: "engineering", label: "Engineering", href: "#" },
  { id: "design", label: "Design", href: "#" },
  { id: "company", label: "Company", href: "#" },
  { id: "guides", label: "Guides", href: "#" },
];

export interface BlogHeaderProps {
  kicker?: string;
  title?: string;
  description?: string;
  categories?: BlogCategory[];
  activeCategory?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function BlogHeader({
  kicker = "Blog",
  title = "Notes from the ledger",
  description = "Product updates, engineering deep dives and guides to closing the month without the stress.",
  categories = sampleCategories,
  activeCategory = "all",
  error,
  loading = false,
  disabled = false,
  onRetry,
}: BlogHeaderProps) {
  return (
    <header className="@container moderno-block-blog-header text-foreground">
      <div className="grid justify-items-center gap-8 px-4 py-12 text-center @lg:gap-10 @lg:py-16">
        <div className="grid max-w-md gap-3">
          {kicker ? <p className="text-ui-sm font-medium text-muted-foreground">{kicker}</p> : null}
          <h1 className="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
          {description ? (
            <p className="text-ui-md text-pretty text-muted-foreground @sm:text-body">
              {description}
            </p>
          ) : null}
        </div>

        {error ? (
          <Alert.Root variant="error" className="w-full max-w-md text-start">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                The posts still load. Try again to bring the categories back.
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
            className="flex flex-wrap justify-center gap-2 @md:gap-3"
          >
            <span className="sr-only">Loading the categories…</span>
            <Skeleton aria-hidden="true" shape="rect" className="h-7 w-20" />
            <Skeleton aria-hidden="true" shape="rect" className="h-7 w-16" />
            <Skeleton aria-hidden="true" shape="rect" className="h-7 w-24" />
            <Skeleton aria-hidden="true" shape="rect" className="h-7 w-16" />
            <Skeleton aria-hidden="true" shape="rect" className="h-7 w-20" />
          </div>
        ) : categories.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-ui-sm text-muted-foreground">
            No categories yet.
          </p>
        ) : (
          <nav aria-label="Categories">
            <ul className="flex flex-wrap justify-center gap-2 @md:gap-3">
              {categories.map((category) => {
                const active = category.id === activeCategory;
                return (
                  <li key={category.id} className="flex">
                    <a
                      className="flex rounded-lg hover:[--border:var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed"
                      href={disabled ? undefined : category.href}
                      role={disabled ? "link" : undefined}
                      aria-disabled={disabled || undefined}
                      aria-current={active ? "page" : undefined}
                    >
                      <Chip variant={active ? "solid" : disabled ? "muted" : "outline"}>
                        {category.label}
                      </Chip>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
