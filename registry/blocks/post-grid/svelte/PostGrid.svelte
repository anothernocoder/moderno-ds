<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  interface PostAuthor {
    name: string;
    initials: string;
    avatarUrl?: string;
  }

  interface PostSummary {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    dateLabel: string;
    author: PostAuthor;
    href?: string;
  }

  interface Props {
    heading?: string;
    description?: string;
    allPostsHref?: string;
    posts?: PostSummary[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onretry?: () => void;
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

  let {
    heading = "From the blog",
    description = "Guides, product notes and the odd story from the team that builds it.",
    allPostsHref = "#",
    posts = samplePosts,
    error,
    loading = false,
    disabled = false,
    onretry,
  }: Props = $props();
</script>

<section class="@container moderno-block-post-grid text-foreground">
  <div class="grid gap-10 px-4 py-12 @lg:py-16">
    <div class="grid gap-4 @sm:flex @sm:items-end @sm:justify-between @sm:gap-6">
      <div class="grid max-w-md gap-3">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
        {#if description}
          <p class="text-body text-muted-foreground">{description}</p>
        {/if}
      </div>
      {#if allPostsHref}
        <a
          class="justify-self-start shrink-0 text-ui-md font-medium {linkClass}"
          href={disabled ? undefined : allPostsHref}
          role={disabled ? "link" : undefined}
          aria-disabled={disabled || undefined}>View all posts</a
        >
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
      <div role="status" aria-busy="true" class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8">
        <span class="sr-only">Loading the posts…</span>
        {#each placeholders as key (key)}
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
        {/each}
      </div>
    {:else if posts.length === 0}
      <p
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        No posts to show yet.
      </p>
    {:else}
      <ul class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-8">
        {#each posts as post (post.id)}
          <li class="flex">
            <Card.Root>
              <Card.Header class="gap-3">
                <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <Badge size="sm">{post.category}</Badge>
                  <time datetime={post.date} class="text-ui-sm text-muted-foreground">{post.dateLabel}</time>
                </div>
                <Card.Title class="text-body-lg text-balance">
                  {#if post.href}
                    <a
                      class={linkClass}
                      href={disabled ? undefined : post.href}
                      role={disabled ? "link" : undefined}
                      aria-disabled={disabled || undefined}>{post.title}</a
                    >
                  {:else}
                    {post.title}
                  {/if}
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <p class="text-pretty text-muted-foreground">{post.excerpt}</p>
              </Card.Content>
              <Card.Footer>
                <Avatar.Root size="sm">
                  <Avatar.Fallback>{post.author.initials}</Avatar.Fallback>
                  {#if post.author.avatarUrl}
                    <Avatar.Image src={post.author.avatarUrl} alt="" />
                  {/if}
                </Avatar.Root>
                <span class="min-w-0 truncate text-ui-sm font-medium">{post.author.name}</span>
              </Card.Footer>
            </Card.Root>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
