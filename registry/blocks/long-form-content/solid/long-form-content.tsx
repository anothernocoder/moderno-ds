import { For, Show } from "solid-js";
import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/solid";

export interface LongFormFact {
  id: string;
  label: string;
  value: string;
}

export interface LongFormSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export interface LongFormQuote {
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

export interface LongFormContentProps {
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
  onAction?: () => void;
  onRetry?: () => void;
}

export function LongFormContent(props: LongFormContentProps) {
  const kicker = () => props.kicker ?? "Case study";
  const heading = () => props.heading ?? "How Northwind closes its books in a day";
  const lead = () =>
    props.lead ??
    "A twelve-person architecture studio replaced three spreadsheets and a shared inbox, and got the last week of every month back.";
  const facts = () => props.facts ?? sampleFacts;
  const sections = () => props.sections ?? sampleSections;
  const quote = () => (props.quote === undefined ? sampleQuote : props.quote);
  const action = () => props.action ?? "Read the next case study";

  return (
    <section class="@container moderno-block-long-form-content text-foreground">
      <div class="px-4 py-12 @lg:py-20">
        <article class="mx-auto grid max-w-lg gap-10">
          <header class="grid max-w-md gap-3">
            <Show when={kicker()}>
              <p class="text-ui-sm font-medium text-muted-foreground">{kicker()}</p>
            </Show>
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">{heading()}</h2>
            <Show when={lead()}>
              <p class="text-body text-muted-foreground @sm:text-body-lg">{lead()}</p>
            </Show>
          </header>

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
                <div role="status" aria-busy="true" class="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
                  <span class="sr-only">Loading the case study…</span>
                  <div
                    aria-hidden="true"
                    class="grid grid-cols-2 gap-x-6 gap-y-4 py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start"
                  >
                    <For each={factPlaceholders}>
                      {() => <Skeleton shape="text" class="w-2/3" />}
                    </For>
                  </div>
                  <div aria-hidden="true" class="grid gap-8 @lg:col-span-2">
                    <For each={sectionPlaceholders}>
                      {() => (
                        <div class="grid gap-3">
                          <Skeleton shape="text" class="w-1/2" />
                          <Skeleton shape="text" class="w-full" />
                          <Skeleton shape="text" class="w-full" />
                          <Skeleton shape="text" class="w-2/3" />
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              }
            >
              <div class="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
                <Show when={facts().length > 0}>
                  <dl class="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start @lg:border-b-0">
                    <For each={facts()}>
                      {(fact) => (
                        <div class="grid gap-1">
                          <dt class="text-ui-sm text-muted-foreground">{fact.label}</dt>
                          <dd class="text-ui-md font-medium">{fact.value}</dd>
                        </div>
                      )}
                    </For>
                  </dl>
                </Show>

                <div class="grid gap-8 @lg:col-span-2">
                  <Show
                    when={sections().length > 0}
                    fallback={
                      <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                        This case study has no story yet.
                      </p>
                    }
                  >
                    <For each={sections()}>
                      {(section, index) => (
                        <>
                          <div class="grid gap-3">
                            <h3 class="text-body font-semibold">{section.heading}</h3>
                            <For each={section.paragraphs}>
                              {(paragraph) => (
                                <p class="text-body text-muted-foreground">{paragraph}</p>
                              )}
                            </For>
                          </div>
                          <Show when={index() === 0 && quote()}>
                            {(shown) => (
                              <figure class="grid gap-4 border-l border-primary pl-4 @sm:pl-6">
                                <blockquote class="font-serif text-body-lg text-balance @md:text-heading-sm">
                                  <p>{shown().text}</p>
                                </blockquote>
                                <figcaption class="flex items-center gap-3">
                                  <Avatar.Root>
                                    <Avatar.Fallback>{shown().initials}</Avatar.Fallback>
                                    <Show when={shown().avatarUrl}>
                                      {(src) => <Avatar.Image src={src()} alt="" />}
                                    </Show>
                                  </Avatar.Root>
                                  <div class="grid min-w-0 gap-0.5">
                                    <p class="text-ui-md font-semibold">{shown().author}</p>
                                    <p class="text-ui-sm text-muted-foreground">{shown().role}</p>
                                  </div>
                                </figcaption>
                              </figure>
                            )}
                          </Show>
                        </>
                      )}
                    </For>
                  </Show>

                  <Show when={sections().length > 0 && action()}>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={props.disabled}
                        onClick={props.onAction}
                      >
                        {action()}
                      </Button>
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
          </Show>
        </article>
      </div>
    </section>
  );
}
