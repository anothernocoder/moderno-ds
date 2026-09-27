import { For, Show } from "solid-js";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/solid";

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
      class="mt-0.5 size-4 shrink-0 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export interface PricingProps {
  title?: string;
  titleLevel?: 1 | 2;
  description?: string;
  plans?: PricingPlan[];
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onSelect?: (id: string) => void;
  onRetry?: () => void;
}

export function Pricing(props: PricingProps) {
  const title = () => props.title ?? "Pricing that grows with you";
  const description = () =>
    props.description ??
    "Start free, then pick the plan that fits how your team works. Change or cancel at any time.";
  const plans = () => props.plans ?? samplePlans;
  const titleRank = () => (props.titleLevel === 1 ? 1 : undefined);
  const planRank = () => (props.titleLevel === 1 ? 2 : undefined);

  return (
    <section class="@container moderno-block-pricing text-foreground">
      <div class="grid gap-8 py-12 @lg:gap-10 @lg:py-16">
        <div class="mx-auto grid max-w-md gap-3 text-center">
          <h2
            class="font-serif text-heading text-balance @md:text-heading-lg"
            aria-level={titleRank()}
          >
            {title()}
          </h2>
          <Show when={description()}>
            <p class="text-body text-muted-foreground">{description()}</p>
          </Show>
        </div>

        <Show
          when={!props.error}
          fallback={
            <Alert.Root variant="error" class="mx-auto w-full max-w-md">
              <Alert.Content>
                <Alert.Title>{props.error}</Alert.Title>
                <Alert.Description>Your current plan has not changed.</Alert.Description>
                <Alert.Action>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={props.disabled}
                    onClick={() => props.onRetry?.()}
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
              <div
                role="status"
                aria-busy="true"
                class="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6"
              >
                <span class="sr-only">Loading plans…</span>
                <For each={placeholders}>
                  {() => (
                    <Card.Root size="sm" aria-hidden="true">
                      <Card.Header>
                        <Skeleton shape="text" class="w-1/3" />
                        <Skeleton shape="text" class="w-3/4" />
                      </Card.Header>
                      <Card.Content>
                        <Skeleton shape="rect" class="h-8 w-24" />
                        <Skeleton shape="text" class="w-2/3" />
                        <Skeleton shape="text" class="w-1/2" />
                      </Card.Content>
                      <Card.Footer>
                        <Skeleton shape="rect" class="h-9 w-full" />
                      </Card.Footer>
                    </Card.Root>
                  )}
                </For>
              </div>
            }
          >
            <Show
              when={plans().length > 0}
              fallback={
                <Card.Root variant="muted" class="mx-auto max-w-md">
                  <Card.Header class="items-center text-center">
                    <Card.Title aria-level={planRank()}>No plans to show yet</Card.Title>
                    <Card.Description>
                      Plans appear here as soon as they are published.
                    </Card.Description>
                  </Card.Header>
                </Card.Root>
              }
            >
              <ul class="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6">
                <For each={plans()}>
                  {(plan) => (
                    <li class="flex">
                      <Card.Root size="sm" class={plan.highlighted ? "border-primary" : undefined}>
                        <Card.Header>
                          <div class="flex items-center justify-between gap-2">
                            <Card.Title aria-level={planRank()}>{plan.name}</Card.Title>
                            <Show when={plan.badge}>
                              <Badge variant="solid" size="sm">
                                {plan.badge}
                              </Badge>
                            </Show>
                          </div>
                          <Show when={plan.description}>
                            <Card.Description>{plan.description}</Card.Description>
                          </Show>
                        </Card.Header>
                        <Card.Content>
                          <p class="flex items-baseline gap-1">
                            <span class="font-serif text-heading">{plan.price}</span>
                            <Show when={plan.period}>
                              <span class="text-ui-md text-muted-foreground">{plan.period}</span>
                            </Show>
                          </p>
                          <ul class="grid gap-2 @sm:grid-cols-2 @md:grid-cols-1">
                            <For each={plan.features}>
                              {(feature) => (
                                <li class="flex gap-2">
                                  <CheckGlyph />
                                  {feature}
                                </li>
                              )}
                            </For>
                          </ul>
                        </Card.Content>
                        <Card.Footer>
                          <Button
                            type="button"
                            variant={plan.highlighted ? "primary" : "outline"}
                            class="w-full"
                            disabled={props.disabled}
                            aria-label={`${plan.action}: ${plan.name}`}
                            onClick={() => props.onSelect?.(plan.id)}
                          >
                            {plan.action}
                          </Button>
                        </Card.Footer>
                      </Card.Root>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </div>
    </section>
  );
}
