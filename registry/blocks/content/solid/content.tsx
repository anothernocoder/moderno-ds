import { For, Show } from "solid-js";
import { Alert, Button, Skeleton } from "@moderno-ui/solid";

export interface ContentSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export interface ContentQuote {
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

export interface ContentProps {
  kicker?: string;
  heading?: string;
  lead?: string;
  sections?: ContentSection[];
  quote?: ContentQuote | null;
  action?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onAction?: () => void;
  onRetry?: () => void;
}

export function Content(props: ContentProps) {
  const kicker = () => props.kicker ?? "Field notes";
  const heading = () => props.heading ?? "Close the month without the spreadsheet";
  const lead = () =>
    props.lead ??
    "Most small teams lose the last days of every month to chasing receipts and matching payments by hand. It does not have to work that way.";
  const sections = () => props.sections ?? sampleSections;
  const quote = () => (props.quote === undefined ? sampleQuote : props.quote);
  const action = () => props.action ?? "Read the full guide";
  const showArticle = () => !props.error && !props.loading && sections().length > 0;

  return (
    <section class="@container moderno-block-content text-foreground">
      <div class="px-4 py-12 @lg:py-16">
        <article class="mx-auto grid max-w-md gap-8">
          <header class="grid gap-3">
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
                <div role="status" aria-busy="true" class="grid gap-8">
                  <span class="sr-only">Loading the article…</span>
                  <For each={placeholders}>
                    {() => (
                      <div aria-hidden="true" class="grid gap-3">
                        <Skeleton shape="text" class="w-1/2" />
                        <Skeleton shape="text" class="w-full" />
                        <Skeleton shape="text" class="w-full" />
                        <Skeleton shape="text" class="w-2/3" />
                      </div>
                    )}
                  </For>
                </div>
              }
            >
              <Show
                when={sections().length > 0}
                fallback={
                  <p class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                    Nothing to read here yet.
                  </p>
                }
              >
                <div class="grid gap-8">
                  <For each={sections()}>
                    {(section) => (
                      <div class="grid gap-3">
                        <h3 class="text-body font-semibold">{section.heading}</h3>
                        <For each={section.paragraphs}>
                          {(paragraph) => (
                            <p class="text-body text-muted-foreground">{paragraph}</p>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                  <Show when={quote()}>
                    {(shown) => (
                      <figure class="grid gap-3 border-l-2 border-border pl-4 @sm:pl-6">
                        <blockquote class="font-serif text-body-lg">{shown().text}</blockquote>
                        <figcaption class="text-ui-md text-muted-foreground">
                          {shown().author}
                        </figcaption>
                      </figure>
                    )}
                  </Show>
                </div>
              </Show>
            </Show>
          </Show>

          <Show when={showArticle() && action()}>
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
        </article>
      </div>
    </section>
  );
}
