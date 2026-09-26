import { For, Show } from "solid-js";
import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/solid";

export interface PostAuthor {
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  dateLabel: string;
  author: PostAuthor;
  href?: string;
}

const samplePosts: PostSummary[] = [
  {
    id: "close-the-month",
    title: "Close the month in an afternoon",
    excerpt:
      "The checklist we use ourselves: match the bank feed, chase the late invoices, then hand the export to your accountant.",
    category: "Guides",
    date: "2026-09-18",
    dateLabel: "Sep 18, 2026",
    author: { name: "Nora Castillo", initials: "NC" },
    href: "#",
  },
  {
    id: "bank-feeds",
    title: "How we keep every bank feed in step",
    excerpt:
      "Three hundred banks, one sync. What we retry, what we reconcile and what we ask you about.",
    category: "Engineering",
    date: "2026-09-11",
    dateLabel: "Sep 11, 2026",
    author: { name: "Jonas Berg", initials: "JB" },
    href: "#",
  },
  {
    id: "reports",
    title: "Designing reports people open on a Monday",
    excerpt:
      "Fewer charts, clearer numbers. How we cut the weekly report down to the four lines that matter.",
    category: "Design",
    date: "2026-09-04",
    dateLabel: "Sep 4, 2026",
    author: { name: "Priya Raman", initials: "PR" },
    href: "#",
  },
  {
    id: "invoices",
    title: "Invoices your clients pay on time",
    excerpt:
      "Clear terms, a due date up top and one gentle reminder. Small changes that halved our late payments.",
    category: "Guides",
    date: "2026-08-28",
    dateLabel: "Aug 28, 2026",
    author: { name: "Kwame Mensah", initials: "KM" },
    href: "#",
  },
  {
    id: "support",
    title: "What five hundred support emails taught us",
    excerpt:
      "The questions you ask most, and the screens we changed so you would not have to ask them again.",
    category: "Company",
    date: "2026-08-21",
    dateLabel: "Aug 21, 2026",
    author: { name: "Elif Demir", initials: "ED" },
    href: "#",
  },
  {
    id: "vat",
    title: "A plain guide to quarterly VAT",
    excerpt:
      "What to set aside, which receipts to keep and the dates to put in your calendar this year.",
    category: "Guides",
    date: "2026-08-14",
    dateLabel: "Aug 14, 2026",
    author: { name: "Luca Moretti", initials: "LM" },
  },
];

const placeholders = ["first", "second", "third"];

const linkClass =
  "rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline";

export interface PostGridProps {
  heading?: string;
  description?: string;
  allPostsHref?: string;
  posts?: PostSummary[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function PostGrid(props: PostGridProps) {
  const heading = () => props.heading ?? "From the blog";
  const description = () =>
    props.description ?? "Guides, product notes and the odd story from the team that builds it.";
  const allPostsHref = () => props.allPostsHref ?? "#";
  const posts = () => props.posts ?? samplePosts;

  return (
    <section class="@container moderno-block-post-grid text-foreground">
      <div class="grid gap-10 px-4 py-12 @lg:py-16">
        <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
          <div class="grid max-w-md gap-3">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
            <Show when={description()}>
              <p class="text-body text-muted-foreground">{description()}</p>
            </Show>
          </div>
          <Show when={allPostsHref()}>
            <a
              class={`justify-self-start shrink-0 text-ui-md font-medium ${linkClass}`}
              href={props.disabled ? undefined : allPostsHref()}
              role={props.disabled ? "link" : undefined}
              aria-disabled={props.disabled || undefined}
            >
              View all posts
            </a>
          </Show>
        </div>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error">
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
                class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8"
              >
                <span class="sr-only">Loading the posts…</span>
                <For each={placeholders}>
                  {() => (
                    <Card.Root aria-hidden="true">
                      <Card.Header class="gap-3">
                        <Skeleton shape="text" class="w-1/4" />
                        <Skeleton shape="text" class="w-3/4" />
                      </Card.Header>
                      <Card.Content class="gap-2">
                        <Skeleton shape="text" />
                        <Skeleton shape="text" class="w-2/3" />
                      </Card.Content>
                      <Card.Footer>
                        <Skeleton shape="circle" class="w-8" />
                        <Skeleton shape="text" class="w-1/3" />
                      </Card.Footer>
                    </Card.Root>
                  )}
                </For>
              </div>
            }
          >
            <Show
              when={posts().length > 0}
              fallback={
                <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                  No posts to show yet.
                </p>
              }
            >
              <ul class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8">
                <For each={posts()}>
                  {(post) => (
                    <li class="flex">
                      <Card.Root>
                        <Card.Header class="gap-3">
                          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <Badge size="sm">{post.category}</Badge>
                            <time datetime={post.date} class="text-ui-sm text-muted-foreground">
                              {post.dateLabel}
                            </time>
                          </div>
                          <Card.Title class="text-body-lg text-balance">
                            <Show when={post.href} fallback={post.title}>
                              <a
                                class={linkClass}
                                href={props.disabled ? undefined : post.href}
                                role={props.disabled ? "link" : undefined}
                                aria-disabled={props.disabled || undefined}
                              >
                                {post.title}
                              </a>
                            </Show>
                          </Card.Title>
                        </Card.Header>
                        <Card.Content>
                          <p class="text-pretty text-muted-foreground">{post.excerpt}</p>
                        </Card.Content>
                        <Card.Footer>
                          <Avatar.Root size="sm">
                            <Avatar.Fallback>{post.author.initials}</Avatar.Fallback>
                            <Show when={post.author.avatarUrl}>
                              <Avatar.Image src={post.author.avatarUrl} alt="" />
                            </Show>
                          </Avatar.Root>
                          <span class="min-w-0 truncate text-ui-sm font-medium">
                            {post.author.name}
                          </span>
                        </Card.Footer>
                      </Card.Root>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
