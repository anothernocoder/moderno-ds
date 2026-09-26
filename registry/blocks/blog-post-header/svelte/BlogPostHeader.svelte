<script lang="ts">
  import { Alert, Avatar, Badge, Button, Skeleton } from "@moderno-ui/svelte";

  interface BlogPostAuthor {
    name: string;
    role: string;
    initials: string;
    avatarUrl?: string;
    href?: string;
  }

  interface Props {
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
    onretry?: () => void;
  }

  const sampleAuthor: BlogPostAuthor = {
    name: "Nora Castillo",
    role: "Co-founder, CEO",
    initials: "NC",
    href: "#",
  };

  let {
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
    onretry,
  }: Props = $props();

  const hasMeta = $derived(Boolean(category || date || readingTime));
</script>

<section class="@container moderno-block-blog-post-header text-foreground">
  <div class="px-4 py-12 @lg:py-20">
    {#if error}
      <Alert.Root variant="error" class="mx-auto w-full max-w-md">
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
    {:else}
      <header
        class="mx-auto grid max-w-lg gap-6 @md:justify-items-center @md:text-center @lg:gap-8"
      >
        {#if hasMeta}
          <div
            class="flex flex-wrap items-center gap-x-3 gap-y-2 text-ui-sm text-muted-foreground @md:justify-center"
          >
            {#if category}
              <Badge variant="neutral">{category}</Badge>
            {/if}
            {#if date || readingTime}
              <span class="flex items-center gap-x-3">
                {#if date}
                  <time datetime={dateTime || undefined}>{date}</time>
                {/if}
                {#if date && readingTime}
                  <span aria-hidden="true">·</span>
                {/if}
                {#if readingTime}
                  <span>{readingTime}</span>
                {/if}
              </span>
            {/if}
          </div>
        {/if}

        <div class="grid gap-4">
          <h1 class="font-serif text-heading text-balance @md:text-heading-lg">{title}</h1>
          {#if excerpt}
            <p
              class="max-w-md text-body text-pretty text-muted-foreground @sm:text-body-lg @md:mx-auto"
            >
              {excerpt}
            </p>
          {/if}
        </div>

        {#if author}
          <div class="flex items-center gap-3 @md:justify-center">
            <Avatar.Root size="md">
              <Avatar.Fallback>{author.initials}</Avatar.Fallback>
              {#if author.avatarUrl}
                <Avatar.Image src={author.avatarUrl} alt="" />
              {/if}
            </Avatar.Root>
            <div class="grid min-w-0 gap-1 text-start">
              <p class="text-ui-md font-semibold">
                {#if author.href}
                  <a
                    class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                    href={disabled ? undefined : author.href}
                    role={disabled ? "link" : undefined}
                    aria-disabled={disabled || undefined}>{author.name}</a
                  >
                {:else}
                  {author.name}
                {/if}
              </p>
              <p class="text-ui-sm text-muted-foreground">{author.role}</p>
            </div>
          </div>
        {/if}
      </header>
    {/if}
  </div>
</section>
