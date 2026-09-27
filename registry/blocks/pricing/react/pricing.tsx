import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/react";

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  action: string;
  highlighted?: boolean;
  badge?: string;
}

const samplePlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For freelancers sending their first invoices.",
    features: ["One bank connection", "Invoices and receipts", "Community support"],
    action: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For small teams that bill every week.",
    features: ["Unlimited bank connections", "Time tracking", "Email support"],
    action: "Start free trial",
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "business",
    name: "Business",
    price: "$99",
    period: "/month",
    description: "For growing companies with an accountant.",
    features: ["Everything in Pro", "Accountant access", "Priority support"],
    action: "Contact sales",
  },
];

const placeholders = ["first", "second", "third"];

function CheckGlyph() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export interface PricingProps {
  title?: string;
  description?: string;
  plans?: PricingPlan[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onSelect?: (id: string) => void;
  onRetry?: () => void;
}

export function Pricing({
  title = "Pricing that grows with you",
  description = "Start free, then pick the plan that fits how your team works. Change or cancel at any time.",
  plans = samplePlans,
  error,
  loading = false,
  disabled = false,
  onSelect,
  onRetry,
}: PricingProps) {
  return (
    <section className="@container moderno-block-pricing text-foreground">
      <div className="grid gap-8 py-12 @lg:gap-10 @lg:py-16">
        <div className="mx-auto grid max-w-md gap-3 text-center">
          <h2 className="font-serif text-heading text-balance @md:text-heading-lg">{title}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>

        {error ? (
          <Alert.Root variant="error" className="mx-auto w-full max-w-md">
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
              <Alert.Description>Your current plan has not changed.</Alert.Description>
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
            className="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6"
          >
            <span className="sr-only">Loading plans…</span>
            {placeholders.map((key) => (
              <Card.Root key={key} size="sm" aria-hidden="true">
                <Card.Header>
                  <Skeleton shape="text" className="w-1/3" />
                  <Skeleton shape="text" className="w-3/4" />
                </Card.Header>
                <Card.Content>
                  <Skeleton shape="rect" className="h-8 w-24" />
                  <Skeleton shape="text" className="w-2/3" />
                  <Skeleton shape="text" className="w-1/2" />
                </Card.Content>
                <Card.Footer>
                  <Skeleton shape="rect" className="h-9 w-full" />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card.Root variant="muted" className="mx-auto max-w-md">
            <Card.Header className="items-center text-center">
              <Card.Title>No plans to show yet</Card.Title>
              <Card.Description>Plans appear here as soon as they are published.</Card.Description>
            </Card.Header>
          </Card.Root>
        ) : (
          <ul className="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6">
            {plans.map((plan) => (
              <li key={plan.id} className="flex">
                <Card.Root size="sm" className={plan.highlighted ? "border-primary" : undefined}>
                  <Card.Header>
                    <div className="flex items-center justify-between gap-2">
                      <Card.Title>{plan.name}</Card.Title>
                      {plan.badge ? (
                        <Badge variant="solid" size="sm">
                          {plan.badge}
                        </Badge>
                      ) : null}
                    </div>
                    {plan.description ? (
                      <Card.Description>{plan.description}</Card.Description>
                    ) : null}
                  </Card.Header>
                  <Card.Content>
                    <p className="flex items-baseline gap-1">
                      <span className="font-serif text-heading">{plan.price}</span>
                      {plan.period ? (
                        <span className="text-ui-md text-muted-foreground">{plan.period}</span>
                      ) : null}
                    </p>
                    <ul className="grid gap-2 @sm:grid-cols-2 @md:grid-cols-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <CheckGlyph />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card.Content>
                  <Card.Footer>
                    <Button
                      type="button"
                      variant={plan.highlighted ? "primary" : "outline"}
                      className="w-full"
                      disabled={disabled}
                      aria-label={`${plan.action}: ${plan.name}`}
                      onClick={() => onSelect?.(plan.id)}
                    >
                      {plan.action}
                    </Button>
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
