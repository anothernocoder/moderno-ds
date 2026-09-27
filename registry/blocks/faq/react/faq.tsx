import { Accordion, Alert, Button, Skeleton } from "@moderno-ui/react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const sampleItems: FaqItem[] = [
  {
    id: "trial",
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan starts with 14 days free, and you add a card only when you decide to stay.",
  },
  {
    id: "cancel",
    question: "Can I cancel at any time?",
    answer:
      "Yes. Cancel from your account settings and you keep access until the end of the billing period.",
  },
  {
    id: "currencies",
    question: "Which currencies can I invoice in?",
    answer:
      "More than 30. Your clients pay in their currency, and the money arrives in the currency of your account.",
  },
  {
    id: "accountant",
    question: "Can I invite my accountant?",
    answer: "Yes. Invite them as a member who can read your invoices, receipts and reports.",
  },
  {
    id: "data",
    question: "Where is my data stored?",
    answer: "In data centres in the European Union, encrypted at rest and in transit.",
  },
];

const placeholders = ["first", "second", "third", "fourth", "fifth"];

function ChevronGlyph() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export interface FaqProps {
  heading?: string;
  description?: string;
  items?: FaqItem[];
  contactText?: string;
  contactLabel?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onContact?: () => void;
  onRetry?: () => void;
}

export function Faq({
  heading = "Frequently asked questions",
  description = "Answers to the questions we hear most about plans, billing and your account.",
  items = sampleItems,
  contactText = "Still have questions? We answer within one working day.",
  contactLabel = "Contact support",
  error,
  loading = false,
  disabled = false,
  onContact,
  onRetry,
}: FaqProps) {
  return (
    <section className="@container moderno-block-faq text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        {error ? (
          <Alert.Root variant="error" className="mx-auto w-full max-w-lg">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>
                The answers are still here. Try again in a moment.
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
          <div
            role="status"
            aria-busy="true"
            className="mx-auto grid w-full max-w-lg divide-y divide-border border-y border-border"
          >
            <span className="sr-only">Loading questions…</span>
            {placeholders.map((key) => (
              <div key={key} aria-hidden="true" className="py-4">
                <Skeleton shape="text" className="w-2/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mx-auto w-full max-w-lg rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No questions here yet.
          </p>
        ) : (
          <Accordion.Root
            collapsible
            disabled={disabled}
            className="mx-auto max-w-lg border-y border-border"
          >
            {items.map((item) => (
              <Accordion.Item key={item.id} value={item.id}>
                <h3>
                  <Accordion.ItemTrigger>
                    {item.question}
                    <Accordion.ItemIndicator>
                      <ChevronGlyph />
                    </Accordion.ItemIndicator>
                  </Accordion.ItemTrigger>
                </h3>
                <Accordion.ItemContent className="text-muted-foreground">
                  {item.answer}
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        )}

        {contactLabel ? (
          <div className="mx-auto grid w-full max-w-lg justify-items-center gap-3 rounded-lg border border-border p-4 text-center @sm:flex @sm:items-center @sm:justify-between @sm:gap-6 @sm:text-start">
            <p className="text-ui-md text-muted-foreground">{contactText}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={onContact}
            >
              {contactLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
