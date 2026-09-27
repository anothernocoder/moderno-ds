import { Alert, Avatar, Badge, Button, Skeleton } from "@moderno-ui/react";

export interface BlogPostAuthor {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
  href?: string;
}

const sampleAuthor: BlogPostAuthor = {
  name: "Nora Castillo",
  role: "Co-founder, CEO",
  initials: "NC",
  href: "#",
};

export interface BlogPostHeaderProps {
  category?: string;
  title?: string;
  excerpt?: string;
  author?: BlogPostAuthor | null;
  date?: string;
  dateTime?: string;
  readingTime?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function BlogPostHeader({
  category = "Product",
  title = "How we closed the books in one afternoon",
  excerpt = "Month-end used to take our finance team three days. Here is what we changed, step by step, and what we would do differently.",
  author = sampleAuthor,
  date = "September 12, 2026",
  dateTime = "2026-09-12",
  readingTime = "6 min read",
  error,
  loading = false,
  disabled = false,
  onRetry,
}: BlogPostHeaderProps) {
  const hasMeta = Boolean(category || date || readingTime);

  return (
    <section className="@container moderno-block-blog-post-header text-foreground">
      <div className="px-4 py-12 @lg:py-20">
        {error ? (
          <Alert.Root variant="error" className="mx-auto w-full max-w-md">
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
            className="mx-auto grid max-w-lg gap-6 @md:justify-items-center @lg:gap-8"
          >
            <span className="sr-only">Loading the post…</span>
            <Skeleton aria-hidden="true" shape="rect" className="h-6 w-40" />
            <div aria-hidden="true" className="grid w-full gap-3 @md:justify-items-center">
              <Skeleton shape="text" className="h-8 w-full @md:h-10" />
              <Skeleton shape="text" className="h-8 w-2/3 @md:h-10" />
            </div>
            <div aria-hidden="true" className="grid w-full max-w-md gap-2 @md:justify-items-center">
              <Skeleton shape="text" className="w-full" />
              <Skeleton shape="text" className="w-3/4" />
            </div>
            <div aria-hidden="true" className="flex items-center gap-3">
              <Skeleton shape="circle" className="w-10" />
              <div className="grid gap-2">
                <Skeleton shape="text" className="w-32" />
                <Skeleton shape="text" className="w-24" />
              </div>
            </div>
          </div>
        ) : (
          <header className="mx-auto grid max-w-lg gap-6 @md:justify-items-center @md:text-center @lg:gap-8">
            {hasMeta ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-ui-sm text-muted-foreground @md:justify-center">
                {category ? <Badge variant="neutral">{category}</Badge> : null}
                {date || readingTime ? (
                  <span className="flex items-center gap-x-3">
                    {date ? <time dateTime={dateTime || undefined}>{date}</time> : null}
                    {date && readingTime ? <span aria-hidden="true">·</span> : null}
                    {readingTime ? <span>{readingTime}</span> : null}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4">
              <h1 className="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
              {excerpt ? (
                <p className="max-w-md text-body text-pretty text-muted-foreground @sm:text-body-lg @md:mx-auto">
                  {excerpt}
                </p>
              ) : null}
            </div>

            {author ? (
              <div className="flex items-center gap-3 @md:justify-center">
                <Avatar.Root size="md">
                  <Avatar.Fallback>{author.initials}</Avatar.Fallback>
                  {author.avatarUrl ? <Avatar.Image src={author.avatarUrl} alt="" /> : null}
                </Avatar.Root>
                <div className="grid min-w-0 gap-1 text-start">
                  <p className="text-ui-md font-semibold">
                    {author.href ? (
                      <a
                        className="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                        href={disabled ? undefined : author.href}
                        role={disabled ? "link" : undefined}
                        aria-disabled={disabled || undefined}
                      >
                        {author.name}
                      </a>
                    ) : (
                      author.name
                    )}
                  </p>
                  <p className="text-ui-sm text-muted-foreground">{author.role}</p>
                </div>
              </div>
            ) : null}
          </header>
        )}
      </div>
    </section>
  );
}
