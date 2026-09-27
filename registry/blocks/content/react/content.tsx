import { Alert, Button, Skeleton } from "@moderno-ui/react";

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

export function Content({
  kicker = "Field notes",
  heading = "Close the month without the spreadsheet",
  lead = "Most small teams lose the last days of every month to chasing receipts and matching payments by hand. It does not have to work that way.",
  sections = sampleSections,
  quote = sampleQuote,
  action = "Read the full guide",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: ContentProps) {
  const showArticle = !error && !loading && sections.length > 0;

  return (
    <section className="@container moderno-block-content text-foreground">
      <div className="px-4 py-12 @lg:py-16">
        <article className="mx-auto grid max-w-md gap-8">
          <header className="grid gap-3">
            {kicker ? (
              <p className="text-ui-sm font-medium text-muted-foreground">{kicker}</p>
            ) : null}
            <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
            {lead ? (
              <p className="text-body text-muted-foreground @sm:text-body-lg">{lead}</p>
            ) : null}
          </header>

          {error ? (
            <Alert.Root variant="error">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
                <Alert.Description>
                  The rest of the page still works. Try again in a moment.
                </Alert.Description>
                <Alert.Action>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                </Alert.Action>
              </Alert.Content>
            </Alert.Root>
          ) : loading ? (
            <div role="status" aria-busy="true" className="grid gap-8">
              <span className="sr-only">Loading the article…</span>
              {placeholders.map((key) => (
                <div key={key} aria-hidden="true" className="grid gap-3">
                  <Skeleton shape="text" className="w-1/2" />
                  <Skeleton shape="text" className="w-full" />
                  <Skeleton shape="text" className="w-full" />
                  <Skeleton shape="text" className="w-2/3" />
                </div>
              ))}
            </div>
          ) : sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
              Nothing to read here yet.
            </p>
          ) : (
            <div className="grid gap-8">
              {sections.map((section) => (
                <div key={section.id} className="grid gap-3">
                  <h3 className="text-body font-semibold">{section.heading}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-body text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
              {quote ? (
                <figure className="grid gap-3 border-l-2 border-border pl-4 @sm:pl-6">
                  <blockquote className="font-serif text-body-lg">{quote.text}</blockquote>
                  <figcaption className="text-ui-md text-muted-foreground">
                    {quote.author}
                  </figcaption>
                </figure>
              ) : null}
            </div>
          )}

          {showArticle && action ? (
            <div>
              <Button type="button" variant="outline" disabled={disabled} onClick={onAction}>
                {action}
              </Button>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
