import { Show } from "solid-js";
import { Alert, Avatar, Badge, Button, Skeleton } from "@moderno-ui/solid";

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

export function BlogPostHeader(props: BlogPostHeaderProps) {
  const category = () => props.category ?? "Product";
  const title = () => props.title ?? "How we closed the books in one afternoon";
  const excerpt = () =>
    props.excerpt ??
    "Month-end used to take our finance team three days. Here is what we changed, step by step, and what we would do differently.";
  const author = () => (props.author === undefined ? sampleAuthor : props.author);
  const date = () => props.date ?? "September 12, 2026";
  const dateTime = () => props.dateTime ?? "2026-09-12";
  const readingTime = () => props.readingTime ?? "6 min read";
  const hasMeta = () => Boolean(category() || date() || readingTime());

  return (
    <section class="@container moderno-block-blog-post-header text-foreground">
      <div class="px-4 py-12 @lg:py-20">
        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error" class="mx-auto w-full max-w-md">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>
                  The rest of the page still works. Try again in a moment.
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
                class="mx-auto grid max-w-lg gap-6 @md:justify-items-center @lg:gap-8"
              >
                <span class="sr-only">Loading the post…</span>
                <Skeleton aria-hidden="true" shape="rect" class="h-6 w-40" />
                <div aria-hidden="true" class="grid w-full gap-3 @md:justify-items-center">
                  <Skeleton shape="text" class="h-8 w-full @md:h-10" />
                  <Skeleton shape="text" class="h-8 w-2/3 @md:h-10" />
                </div>
                <div aria-hidden="true" class="grid w-full max-w-md gap-2 @md:justify-items-center">
                  <Skeleton shape="text" class="w-full" />
                  <Skeleton shape="text" class="w-3/4" />
                </div>
                <div aria-hidden="true" class="flex items-center gap-3">
                  <Skeleton shape="circle" class="w-10" />
                  <div class="grid gap-2">
                    <Skeleton shape="text" class="w-32" />
                    <Skeleton shape="text" class="w-24" />
                  </div>
                </div>
              </div>
            }
          >
            <header class="mx-auto grid max-w-lg gap-6 @md:justify-items-center @md:text-center @lg:gap-8">
              <Show when={hasMeta()}>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-ui-sm text-muted-foreground @md:justify-center">
                  <Show when={category()}>
                    <Badge variant="neutral">{category()}</Badge>
                  </Show>
                  <Show when={date() || readingTime()}>
                    <span class="flex items-center gap-x-3">
                      <Show when={date()}>
                        <time dateTime={dateTime() || undefined}>{date()}</time>
                      </Show>
                      <Show when={date() && readingTime()}>
                        <span aria-hidden="true">·</span>
                      </Show>
                      <Show when={readingTime()}>
                        <span>{readingTime()}</span>
                      </Show>
                    </span>
                  </Show>
                </div>
              </Show>

              <div class="grid gap-4">
                <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title()}</h1>
                <Show when={excerpt()}>
                  <p class="max-w-md text-body text-pretty text-muted-foreground @sm:text-body-lg @md:mx-auto">
                    {excerpt()}
                  </p>
                </Show>
              </div>

              <Show when={author()}>
                {(shown) => (
                  <div class="flex items-center gap-3 @md:justify-center">
                    <Avatar.Root size="md">
                      <Avatar.Fallback>{shown().initials}</Avatar.Fallback>
                      <Show when={shown().avatarUrl}>
                        <Avatar.Image src={shown().avatarUrl} alt="" />
                      </Show>
                    </Avatar.Root>
                    <div class="grid min-w-0 gap-1 text-start">
                      <p class="text-ui-md font-semibold">
                        <Show when={shown().href} fallback={shown().name}>
                          <a
                            class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                            href={props.disabled ? undefined : shown().href}
                            role={props.disabled ? "link" : undefined}
                            aria-disabled={props.disabled || undefined}
                          >
                            {shown().name}
                          </a>
                        </Show>
                      </p>
                      <p class="text-ui-sm text-muted-foreground">{shown().role}</p>
                    </div>
                  </div>
                )}
              </Show>
            </header>
          </Show>
        </Show>
      </div>
    </section>
  );
}
