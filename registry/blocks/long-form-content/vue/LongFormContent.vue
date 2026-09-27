<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/vue";

interface LongFormFact {
  id: string;
  label: string;
  value: string;
}

interface LongFormSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

interface LongFormQuote {
  text: string;
  author: string;
  role: string;
  initials: string;
  avatarUrl?: string;
}

const sampleFacts: LongFormFact[] = [
  { id: "client", label: "Client", value: "Northwind Studio" },
  { id: "industry", label: "Industry", value: "Architecture" },
  { id: "team", label: "Team", value: "12 people" },
  { id: "timeline", label: "Timeline", value: "Six weeks" },
];

const sampleSections: LongFormSection[] = [
  {
    id: "challenge",
    heading: "The challenge",
    paragraphs: [
      "Northwind ran its books from three spreadsheets and a shared inbox. Every month-end, two people spent three days matching receipts to payments by hand.",
      "Nobody trusted the numbers until the last invoice was found, so every decision about hiring or new projects waited for the books to close.",
    ],
  },
  {
    id: "approach",
    heading: "Our approach",
    paragraphs: [
      "We moved every receipt into one inbox and let each payment find its match. Anything unclear was set aside for a person, with the likely matches listed next to it.",
      "Categories were learned from the choices the team had already made, so there were no rules to write and no new habits to learn.",
    ],
  },
  {
    id: "outcome",
    heading: "The outcome",
    paragraphs: [
      "The books now close on the first working day of the month. The team reviews a handful of items, not hundreds, and the numbers are ready when a decision is.",
    ],
  },
];

const sampleQuote: LongFormQuote = {
  text: "We stopped dreading the last week of the month. The books close themselves now, and we get the afternoon back.",
  author: "Maya Lindqvist",
  role: "Operations lead, Northwind Studio",
  initials: "ML",
};

const factPlaceholders = ["client", "industry", "team", "timeline"];
const sectionPlaceholders = ["first", "second"];

const props = withDefaults(
  defineProps<{
    kicker?: string;
    heading?: string;
    lead?: string;
    facts?: LongFormFact[];
    sections?: LongFormSection[];
    quote?: LongFormQuote | null;
    action?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    kicker: "Case study",
    heading: "How Northwind closes its books in a day",
    lead: "A twelve-person architecture studio replaced three spreadsheets and a shared inbox, and got the last week of every month back.",
    facts: undefined,
    sections: undefined,
    quote: undefined,
    action: "Read the next case study",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

const resolvedFacts = computed(() => props.facts ?? sampleFacts);
const resolvedSections = computed(() => props.sections ?? sampleSections);
const resolvedQuote = computed(() => (props.quote === undefined ? sampleQuote : props.quote));
</script>

<template>
  <section class="@container moderno-block-long-form-content text-foreground">
    <div class="px-4 py-12 @lg:py-20">
      <article class="mx-auto grid max-w-lg gap-10">
        <header class="grid max-w-md gap-3">
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
        <div
          v-else-if="loading"
          role="status"
          aria-busy="true"
          class="grid gap-10 @lg:grid-cols-3 @lg:gap-12"
        >
          <span class="sr-only">Loading the case study…</span>
          <div
            aria-hidden="true"
            class="grid grid-cols-2 gap-x-6 gap-y-4 py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start"
          >
            <Skeleton v-for="key in factPlaceholders" :key="key" shape="text" class="w-2/3" />
          </div>
          <div aria-hidden="true" class="grid gap-8 @lg:col-span-2">
            <div v-for="key in sectionPlaceholders" :key="key" class="grid gap-3">
              <Skeleton shape="text" class="w-1/2" />
              <Skeleton shape="text" class="w-full" />
              <Skeleton shape="text" class="w-full" />
              <Skeleton shape="text" class="w-2/3" />
            </div>
          </div>
        </div>
        <div v-else class="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
          <dl
            v-if="resolvedFacts.length > 0"
            class="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start @lg:border-b-0"
          >
            <div v-for="fact in resolvedFacts" :key="fact.id" class="grid gap-1">
              <dt class="text-ui-sm text-muted-foreground">{{ fact.label }}</dt>
              <dd class="text-ui-md font-medium">{{ fact.value }}</dd>
            </div>
          </dl>

          <div class="grid gap-8 @lg:col-span-2">
            <p
              v-if="resolvedSections.length === 0"
              class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
            >
              This case study has no story yet.
            </p>
            <template v-else>
              <template v-for="(section, index) in resolvedSections" :key="section.id">
                <div class="grid gap-3">
                  <h3 class="text-body font-semibold">{{ section.heading }}</h3>
                  <p
                    v-for="paragraph in section.paragraphs"
                    :key="paragraph"
                    class="text-body text-muted-foreground"
                  >
                    {{ paragraph }}
                  </p>
                </div>
                <figure
                  v-if="index === 0 && resolvedQuote"
                  class="grid gap-4 border-l-2 border-primary pl-4 @sm:pl-6"
                >
                  <blockquote class="font-serif text-body-lg text-balance @md:text-heading-sm">
                    <p>{{ resolvedQuote.text }}</p>
                  </blockquote>
                  <figcaption class="flex items-center gap-3">
                    <Avatar.Root>
                      <Avatar.Fallback>{{ resolvedQuote.initials }}</Avatar.Fallback>
                      <Avatar.Image
                        v-if="resolvedQuote.avatarUrl"
                        :src="resolvedQuote.avatarUrl"
                        alt=""
                      />
                    </Avatar.Root>
                    <div class="grid min-w-0 gap-0.5">
                      <p class="text-ui-md font-semibold">{{ resolvedQuote.author }}</p>
                      <p class="text-ui-sm text-muted-foreground">{{ resolvedQuote.role }}</p>
                    </div>
                  </figcaption>
                </figure>
              </template>
            </template>

            <div v-if="resolvedSections.length > 0 && action">
              <Button type="button" variant="outline" :disabled="disabled" @click="emit('action')">
                {{ action }}
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
