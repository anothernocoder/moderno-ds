import { Fragment } from "react";
import { Alert, Avatar, Button, Skeleton } from "@moderno-ui/react";

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

export function LongFormContent({
  kicker = "Case study",
  heading = "How Northwind closes its books in a day",
  lead = "A twelve-person architecture studio replaced three spreadsheets and a shared inbox, and got the last week of every month back.",
  facts = sampleFacts,
  sections = sampleSections,
  quote = sampleQuote,
  action = "Read the next case study",
  error,
  loading = false,
  disabled = false,
  onAction,
  onRetry,
}: LongFormContentProps) {
  return (
    <section className="@container moderno-block-long-form-content text-foreground">
      <div className="px-4 py-12 @lg:py-20">
        <article className="mx-auto grid max-w-lg gap-10">
          <header className="grid max-w-md gap-3">
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
            <div role="status" aria-busy="true" className="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
              <span className="sr-only">Loading the case study…</span>
              <div
                aria-hidden="true"
                className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start"
              >
                {factPlaceholders.map((key) => (
                  <Skeleton key={key} shape="text" className="w-2/3" />
                ))}
              </div>
              <div aria-hidden="true" className="grid gap-8 @lg:col-span-2">
                {sectionPlaceholders.map((key) => (
                  <div key={key} className="grid gap-3">
                    <Skeleton shape="text" className="w-1/2" />
                    <Skeleton shape="text" className="w-full" />
                    <Skeleton shape="text" className="w-full" />
                    <Skeleton shape="text" className="w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-10 @lg:grid-cols-3 @lg:gap-12">
              {facts.length > 0 ? (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 @md:grid-cols-4 @lg:grid-cols-1 @lg:self-start @lg:border-b-0">
                  {facts.map((fact) => (
                    <div key={fact.id} className="grid gap-1">
                      <dt className="text-ui-sm text-muted-foreground">{fact.label}</dt>
                      <dd className="text-ui-md font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="grid gap-8 @lg:col-span-2">
                {sections.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
                    This case study has no story yet.
                  </p>
                ) : (
                  sections.map((section, index) => (
                    <Fragment key={section.id}>
                      <div className="grid gap-3">
                        <h3 className="text-body font-semibold">{section.heading}</h3>
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="text-body text-muted-foreground">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      {index === 0 && quote ? (
                        <figure className="grid gap-4 border-l-2 border-primary pl-4 @sm:pl-6">
                          <blockquote className="font-serif text-body-lg text-balance @md:text-heading-sm">
                            <p>{quote.text}</p>
                          </blockquote>
                          <figcaption className="flex items-center gap-3">
                            <Avatar.Root>
                              <Avatar.Fallback>{quote.initials}</Avatar.Fallback>
                              {quote.avatarUrl ? (
                                <Avatar.Image src={quote.avatarUrl} alt="" />
                              ) : null}
                            </Avatar.Root>
                            <div className="grid min-w-0 gap-0.5">
                              <p className="text-ui-md font-semibold">{quote.author}</p>
                              <p className="text-ui-sm text-muted-foreground">{quote.role}</p>
                            </div>
                          </figcaption>
                        </figure>
                      ) : null}
                    </Fragment>
                  ))
                )}

                {sections.length > 0 && action ? (
                  <div>
                    <Button type="button" variant="outline" disabled={disabled} onClick={onAction}>
                      {action}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
