<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Badge, Button, Card, Progress, Skeleton } from "@moderno-ui/vue";

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

const starPath =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

function countRatings(reviews: Review[]): RatingCount[] {
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
}

const props = withDefaults(
  defineProps<{
    heading?: string;
    reviews?: Review[];
    breakdown?: RatingCount[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    heading: "Customer reviews",
    reviews: undefined,
    breakdown: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  writeReview: [];
  retry: [];
}>();

const shownReviews = computed(() => props.reviews ?? sampleReviews);
const counts = computed(
  () =>
    props.breakdown ??
    (props.reviews === undefined ? sampleBreakdown : countRatings(props.reviews)),
);
const total = computed(() => counts.value.reduce((sum, row) => sum + row.count, 0));
const average = computed(() =>
  total.value === 0
    ? 0
    : counts.value.reduce((sum, row) => sum + row.rating * row.count, 0) / total.value,
);
const shares = computed(() =>
  counts.value.map((row) => ({
    ...row,
    label: `${row.rating} ${row.rating === 1 ? "star" : "stars"}`,
    percent: total.value === 0 ? 0 : Math.round((row.count / total.value) * 100),
  })),
);
const showSummary = computed(() => !props.error && !props.loading && shownReviews.value.length > 0);
</script>

<template>
  <section class="@container moderno-block-reviews text-foreground">
    <div class="grid gap-10 px-4 py-12 @lg:grid-cols-3 @lg:gap-x-12 @lg:py-16">
      <div class="grid content-start gap-8">
        <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>

        <div v-if="loading" aria-hidden="true" class="grid gap-6 @md:grid-cols-2 @lg:grid-cols-1">
          <div class="grid gap-2">
            <Skeleton shape="text" class="w-1/4" />
            <Skeleton shape="text" class="w-1/2" />
          </div>
          <div class="grid gap-3">
            <Skeleton v-for="position in starPositions" :key="position" shape="text" />
          </div>
        </div>
        <div
          v-else-if="showSummary"
          class="grid gap-6 @md:grid-cols-2 @md:items-center @lg:grid-cols-1"
        >
          <div class="flex items-center gap-4">
            <p class="font-serif text-heading-lg">
              {{ average.toFixed(1) }} <span class="sr-only">out of 5 stars</span>
            </p>
            <div class="grid gap-1">
              <div class="flex gap-0.5">
                <svg
                  v-for="position in starPositions"
                  :key="position"
                  :class="[
                    'size-5',
                    position <= Math.round(average) ? 'text-foreground' : 'text-muted-foreground',
                  ]"
                  viewBox="0 0 24 24"
                  :fill="position <= Math.round(average) ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path :d="starPath" />
                </svg>
              </div>
              <p class="text-ui-sm text-muted-foreground">
                Based on {{ total }} {{ total === 1 ? "review" : "reviews" }}
              </p>
            </div>
          </div>
          <div class="grid gap-3">
            <Progress.Root
              v-for="row in shares"
              :key="row.rating"
              size="sm"
              :model-value="row.percent"
            >
              <Progress.Label>{{ row.label }}</Progress.Label>
              <Progress.ValueText>{{ row.percent }}%</Progress.ValueText>
              <Progress.Track :aria-label="row.label">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </div>
        </div>

        <div class="grid justify-items-start gap-3">
          <h3 class="text-body font-semibold">Share your thoughts</h3>
          <p class="text-ui-md text-muted-foreground">
            Used it? Tell other customers what you think.
          </p>
          <Button type="button" variant="outline" :disabled="disabled" @click="emit('writeReview')">
            Write a review
          </Button>
        </div>
      </div>

      <div class="@lg:col-span-2">
        <Alert.Root v-if="error" variant="error">
          <Alert.Content>
            <Alert.Title>{{ error }}</Alert.Title>
            <Alert.Description>
              The rest of the page still works. Try again in a moment.
            </Alert.Description>
            <Alert.Action>
              <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                @click="emit('retry')"
              >
                Try again
              </Button>
            </Alert.Action>
          </Alert.Content>
        </Alert.Root>
        <div v-else-if="loading" role="status" aria-busy="true" class="grid gap-4">
          <span class="sr-only">Loading reviews…</span>
          <Card.Root v-for="key in placeholders" :key="key" size="sm" aria-hidden="true">
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
        </div>
        <p
          v-else-if="shownReviews.length === 0"
          class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
        >
          No reviews yet. Be the first to write one.
        </p>
        <ul v-else class="grid gap-4">
          <li v-for="review in shownReviews" :key="review.id">
            <Card.Root size="sm">
              <Card.Content>
                <div class="flex items-center gap-3">
                  <Avatar.Root>
                    <Avatar.Fallback>{{ review.initials }}</Avatar.Fallback>
                    <Avatar.Image v-if="review.avatarUrl" :src="review.avatarUrl" alt="" />
                  </Avatar.Root>
                  <div class="grid min-w-0 gap-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="text-ui-md font-semibold">{{ review.author }}</p>
                      <Badge v-if="review.verified" variant="success" size="sm">
                        Verified purchase
                      </Badge>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <div
                        role="img"
                        :aria-label="`${review.rating} out of 5 stars`"
                        class="flex gap-0.5"
                      >
                        <svg
                          v-for="position in starPositions"
                          :key="position"
                          :class="[
                            'size-4',
                            position <= Math.round(review.rating)
                              ? 'text-foreground'
                              : 'text-muted-foreground',
                          ]"
                          viewBox="0 0 24 24"
                          :fill="position <= Math.round(review.rating) ? 'currentColor' : 'none'"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path :d="starPath" />
                        </svg>
                      </div>
                      <p class="text-ui-sm text-muted-foreground">{{ review.date }}</p>
                    </div>
                  </div>
                </div>
                <p class="text-ui-md text-pretty @sm:text-body">{{ review.content }}</p>
              </Card.Content>
            </Card.Root>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
