<script setup lang="ts">
import { computed } from "vue";
import { Alert, Button, Skeleton } from "@moderno-ui/vue";

interface ContentSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

interface ContentQuote {
  text: string;
  author: string;
}

const sampleSections: ContentSection[] = [
  {
    id: "inbox",
    heading: "Start with one inbox",
    paragraphs: [
      "Forward every receipt and invoice to a single address. Each one is read, dated and filed against the payment it belongs to, so nothing waits in a folder on someone's desk.",
      "When a match is unclear, it is set aside for a person to confirm, with the likely payments already listed next to it.",
    ],
  },
  {
    id: "books",
    heading: "Let the books keep themselves",
    paragraphs: [
      "Categories are learned from the choices you have already made. After a few weeks most payments arrive sorted, and the rest take one click.",
      "At the end of the month there is nothing left to chase. You review the few items that need a person, and the books are closed.",
    ],
  },
];

const sampleQuote: ContentQuote = {
  text: "Month-end used to take us three days. Now it is one afternoon, and most of it is coffee.",
  author: "Finance lead at a twelve-person studio",
};

const placeholders = ["first", "second"];

const props = withDefaults(
  defineProps<{
    kicker?: string;
    heading?: string;
    lead?: string;
    sections?: ContentSection[];
    quote?: ContentQuote | null;
    action?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    kicker: "Field notes",
    heading: "Close the month without the spreadsheet",
    lead: "Most small teams lose the last days of every month to chasing receipts and matching payments by hand. It does not have to work that way.",
    sections: undefined,
    quote: undefined,
    action: "Read the full guide",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

const resolvedSections = computed(() => props.sections ?? sampleSections);
const resolvedQuote = computed(() => (props.quote === undefined ? sampleQuote : props.quote));
const showArticle = computed(
  () => !props.error && !props.loading && resolvedSections.value.length > 0,
);
</script>

<template>
  <section class="@container moderno-block-content text-foreground">
    <div class="px-4 py-12 @lg:py-16">
      <article class="mx-auto grid max-w-md gap-8">
        <header class="grid gap-3">
          <p v-if="kicker" class="text-ui-sm font-medium text-muted-foreground">{{ kicker }}</p>
          <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{{ heading }}</h2>
          <p v-if="lead" class="text-body text-muted-foreground @sm:text-body-lg">{{ lead }}</p>
        </header>

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
        <div v-else-if="loading" role="status" aria-busy="true" class="grid gap-8">
          <span class="sr-only">Loading the article…</span>
          <div v-for="key in placeholders" :key="key" aria-hidden="true" class="grid gap-3">
            <Skeleton shape="text" class="w-1/2" />
            <Skeleton shape="text" class="w-full" />
            <Skeleton shape="text" class="w-full" />
            <Skeleton shape="text" class="w-2/3" />
          </div>
        </div>
        <p
          v-else-if="resolvedSections.length === 0"
          class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
        >
          Nothing to read here yet.
        </p>
        <div v-else class="grid gap-8">
          <div v-for="section in resolvedSections" :key="section.id" class="grid gap-3">
            <h3 class="text-body font-semibold">{{ section.heading }}</h3>
            <p
              v-for="paragraph in section.paragraphs"
              :key="paragraph"
              class="text-body text-muted-foreground"
            >
              {{ paragraph }}
            </p>
          </div>
          <figure v-if="resolvedQuote" class="grid gap-3 border-l border-border pl-4 @sm:pl-6">
            <blockquote class="font-serif text-body-lg">{{ resolvedQuote.text }}</blockquote>
            <figcaption class="text-ui-md text-muted-foreground">
              {{ resolvedQuote.author }}
            </figcaption>
          </figure>
        </div>

        <div v-if="showArticle && action">
          <Button type="button" variant="outline" :disabled="disabled" @click="emit('action')">
            {{ action }}
          </Button>
        </div>
      </article>
    </div>
  </section>
</template>
