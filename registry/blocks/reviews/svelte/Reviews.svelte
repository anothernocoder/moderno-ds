<script lang="ts">
  import { Alert, Avatar, Badge, Button, Card, Progress, Skeleton } from "@moderno-ui/svelte";

  interface Review {
    id: string;
    author: string;
    initials: string;
    avatarUrl?: string;
    rating: number;
    date: string;
    content: string;
    verified?: boolean;
  }

  interface RatingCount {
    rating: number;
    count: number;
  }

  interface Props {
    heading?: string;
    reviews?: Review[];
    breakdown?: RatingCount[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onwritereview?: () => void;
    onretry?: () => void;
  }

  const sampleReviews: Review[] = [
    {
      id: "camila",
      author: "Camila Restrepo",
      initials: "CR",
      rating: 5,
      date: "June 3, 2026",
      content:
        "The glaze is even deeper in person. It keeps my coffee warm longer than my old mug, and it has been through the dishwasher every day for a month.",
      verified: true,
    },
    {
      id: "julian",
      author: "Julián Torres",
      initials: "JT",
      rating: 4,
      date: "May 22, 2026",
      content:
        "A good weight and a comfortable handle. Four stars because the colour is a little lighter than in the photos.",
      verified: true,
    },
    {
      id: "marcela",
      author: "Marcela Gómez",
      initials: "MG",
      rating: 5,
      date: "May 8, 2026",
      content:
        "My second one from this line. Same quality as the first, and it arrived two days early.",
    },
  ];

  const sampleBreakdown: RatingCount[] = [
    { rating: 5, count: 86 },
    { rating: 4, count: 28 },
    { rating: 3, count: 10 },
    { rating: 2, count: 5 },
    { rating: 1, count: 3 },
  ];

  const starPositions = [1, 2, 3, 4, 5];

  const placeholders = ["first", "second", "third"];

  function countRatings(reviews: Review[]): RatingCount[] {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));
  }

  let {
    heading = "Customer reviews",
    reviews,
    breakdown,
    error,
    loading = false,
    disabled = false,
    onwritereview,
    onretry,
  }: Props = $props();

  const shownReviews = $derived(reviews ?? sampleReviews);
  const counts = $derived(
    breakdown ?? (reviews === undefined ? sampleBreakdown : countRatings(reviews)),
  );
  const total = $derived(counts.reduce((sum, row) => sum + row.count, 0));
  const average = $derived(
    total === 0 ? 0 : counts.reduce((sum, row) => sum + row.rating * row.count, 0) / total,
  );
  const shares = $derived(
    counts.map((row) => ({
      ...row,
      label: `${row.rating} ${row.rating === 1 ? "star" : "stars"}`,
      percent: total === 0 ? 0 : Math.round((row.count / total) * 100),
    })),
  );
  const showSummary = $derived(!error && !loading && shownReviews.length > 0);
</script>

{#snippet stars(rating: number, size: string)}
  {#each starPositions as position (position)}
    <svg
      class="{size} {position <= Math.round(rating) ? 'text-foreground' : 'text-muted-foreground'}"
      viewBox="0 0 24 24"
      fill={position <= Math.round(rating) ? "currentColor" : "none"}
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      />
    </svg>
  {/each}
{/snippet}

<section class="@container moderno-block-reviews text-foreground">
  <div class="grid gap-10 px-4 py-12 @lg:grid-cols-3 @lg:gap-x-12 @lg:py-16">
    <div class="grid content-start gap-8">
      <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>

      {#if loading}
        <div aria-hidden="true" class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-1">
          <div class="grid gap-2">
            <Skeleton shape="text" class="w-1/4" />
            <Skeleton shape="text" class="w-1/2" />
          </div>
          <div class="grid gap-3">
            {#each starPositions as position (position)}
              <Skeleton shape="text" />
            {/each}
          </div>
        </div>
      {:else if showSummary}
        <div class="grid gap-6 @md:grid-cols-2 @md:items-center @lg:grid-cols-1">
          <div class="flex items-center gap-4">
            <p class="font-serif text-heading-lg">
              {average.toFixed(1)} <span class="sr-only">out of 5 stars</span>
            </p>
            <div class="grid gap-1">
              <div class="flex gap-0.5">
                {@render stars(average, "size-5")}
              </div>
              <p class="text-ui-sm text-muted-foreground">
                Based on {total}
                {total === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
          <div class="grid gap-3">
            {#each shares as row (row.rating)}
              <Progress.Root size="sm" value={row.percent}>
                <Progress.Label>{row.label}</Progress.Label>
                <Progress.ValueText>{row.percent}%</Progress.ValueText>
                <Progress.Track aria-label={row.label}>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            {/each}
          </div>
        </div>
      {/if}

      <div class="grid justify-items-start gap-3">
        <h3 class="text-body font-semibold">Share your thoughts</h3>
        <p class="text-ui-md text-muted-foreground">
          Used it? Tell other customers what you think.
        </p>
        <Button type="button" variant="outline" {disabled} onclick={onwritereview}>
          Write a review
        </Button>
      </div>
    </div>

    <div class="@lg:col-span-2">
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
        <div role="status" aria-busy="true" class="grid gap-4">
          <span class="sr-only">Loading reviews…</span>
          {#each placeholders as key (key)}
            <Card.Root size="sm" aria-hidden="true">
              <Card.Content>
                <div class="flex items-center gap-3">
                  <Skeleton shape="circle" class="w-10" />
                  <div class="grid flex-1 gap-2">
                    <Skeleton shape="text" class="w-1/3" />
                    <Skeleton shape="text" class="w-1/4" />
                  </div>
                </div>
                <Skeleton shape="text" />
                <Skeleton shape="text" class="w-2/3" />
              </Card.Content>
            </Card.Root>
          {/each}
        </div>
      {:else if shownReviews.length === 0}
        <p
          class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
        >
          No reviews yet. Be the first to write one.
        </p>
      {:else}
        <ul class="grid gap-4">
          {#each shownReviews as review (review.id)}
            <li>
              <Card.Root size="sm">
                <Card.Content>
                  <div class="flex items-center gap-3">
                    <Avatar.Root>
                      <Avatar.Fallback>{review.initials}</Avatar.Fallback>
                      {#if review.avatarUrl}
                        <Avatar.Image src={review.avatarUrl} alt="" />
                      {/if}
                    </Avatar.Root>
                    <div class="grid min-w-0 gap-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-ui-md font-semibold">{review.author}</p>
                        {#if review.verified}
                          <Badge variant="success" size="sm">Verified purchase</Badge>
                        {/if}
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        <div
                          role="img"
                          aria-label="{review.rating} out of 5 stars"
                          class="flex gap-0.5"
                        >
                          {@render stars(review.rating, "size-4")}
                        </div>
                        <p class="text-ui-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                  </div>
                  <p class="text-ui-md text-pretty @sm:text-body">{review.content}</p>
                </Card.Content>
              </Card.Root>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</section>
