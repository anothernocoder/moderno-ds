import { Alert, Avatar, Button, Card, Skeleton } from "@moderno-ui/react";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;
  href?: string;
}

const sampleTestimonials: Testimonial[] = [
  {
    id: "maya",
    quote:
      "We closed our books in two days instead of two weeks. I finally know where every invoice stands.",
    name: "Maya Lindqvist",
    role: "Founder, Northwind Studio",
    initials: "ML",
    href: "#",
  },
  {
    id: "tomas",
    quote:
      "Time tracking and invoicing live in one place, so nothing slips through. Our clients pay faster.",
    name: "Tomás Herrera",
    role: "Operations Lead, Brightline",
    initials: "TH",
    href: "#",
  },
  {
    id: "aiko",
    quote:
      "Our accountant logs in, finds what she needs and leaves. That alone saves us an afternoon every month.",
    name: "Aiko Tanaka",
    role: "CFO, Parcelworks",
    initials: "AT",
    href: "#",
  },
  {
    id: "david",
    quote:
      "Setting it up took ten minutes. The first report found a subscription we had forgotten for a year.",
    name: "David Okafor",
    role: "Owner, Okafor Bakery",
    initials: "DO",
    href: "#",
  },
  {
    id: "lena",
    quote: "It feels calm. Everything I need is on one screen, and nothing I do not.",
    name: "Lena Fischer",
    role: "Freelance Designer",
    initials: "LF",
    href: "#",
  },
  {
    id: "sam",
    quote:
      "We moved from three spreadsheets to one tool. The team actually looks forward to the Monday money check.",
    name: "Sam Rivera",
    role: "Co-founder, Fieldnote",
    initials: "SR",
  },
];

const placeholders = ["first", "second", "third"];

function QuoteGlyph() {
  return (
    <svg
      className="size-5 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
      <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </svg>
  );
}

export interface TestimonialsProps {
  heading?: string;
  description?: string;
  testimonials?: Testimonial[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
}

export function Testimonials({
  heading = "What our customers say",
  description = "Small teams use it every day to send invoices, track time and close their books.",
  testimonials = sampleTestimonials,
  error,
  loading = false,
  disabled = false,
  onRetry,
}: TestimonialsProps) {
  return (
    <section className="@container moderno-block-testimonials text-foreground">
      <div className="grid gap-10 px-4 py-12 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <h2 className="font-serif text-heading-sm text-balance @md:text-heading">{heading}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        {error ? (
          <Alert.Root variant="error" className="mx-auto w-full max-w-md">
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
          <div
            role="status"
            aria-busy="true"
            className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-6"
          >
            <span className="sr-only">Loading testimonials…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} size="sm" aria-hidden="true">
                <Card.Content>
                  <Skeleton shape="text" />
                  <Skeleton shape="text" />
                  <Skeleton shape="text" className="w-2/3" />
                </Card.Content>
                <Card.Footer>
                  <Skeleton shape="circle" className="w-10" />
                  <div className="grid flex-1 gap-2">
                    <Skeleton shape="text" className="w-1/2" />
                    <Skeleton shape="text" className="w-1/3" />
                  </div>
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="mx-auto w-full max-w-md rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground">
            No testimonials yet. Check back soon.
          </p>
        ) : (
          <ul className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3 @lg:gap-6">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="flex">
                <Card.Root size="sm">
                  <Card.Content>
                    <QuoteGlyph />
                    <blockquote className="text-ui-md text-pretty @sm:text-body">
                      <p>“{testimonial.quote}”</p>
                    </blockquote>
                  </Card.Content>
                  <Card.Footer>
                    <Avatar.Root>
                      <Avatar.Fallback>{testimonial.initials}</Avatar.Fallback>
                      {testimonial.avatarUrl ? (
                        <Avatar.Image src={testimonial.avatarUrl} alt="" />
                      ) : null}
                    </Avatar.Root>
                    <div className="grid min-w-0 gap-0.5">
                      <p className="text-ui-md font-semibold">
                        {testimonial.href ? (
                          <a
                            className="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
                            href={disabled ? undefined : testimonial.href}
                            role={disabled ? "link" : undefined}
                            aria-disabled={disabled || undefined}
                          >
                            {testimonial.name}
                          </a>
                        ) : (
                          testimonial.name
                        )}
                      </p>
                      <p className="text-ui-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </Card.Footer>
                </Card.Root>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
