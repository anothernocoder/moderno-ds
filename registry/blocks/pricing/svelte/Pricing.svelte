<script lang="ts">
  import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/svelte";

  interface PricingPlan {
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

  interface Props {
    title?: string;
    titleLevel?: 1 | 2;
    description?: string;
    plans?: PricingPlan[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    onselect?: (id: string) => void;
    onretry?: () => void;
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

  let {
    title = "Pricing that grows with you",
    titleLevel = 2,
    description = "Start free, then pick the plan that fits how your team works. Change or cancel at any time.",
    plans = samplePlans,
    error,
    loading = false,
    disabled = false,
    onselect,
    onretry,
  }: Props = $props();

  const titleRank = $derived(titleLevel === 1 ? 1 : undefined);
  const planRank = $derived(titleLevel === 1 ? 2 : undefined);
</script>

<section class="@container moderno-block-pricing text-foreground">
  <div class="grid gap-8 py-12 @lg:gap-10 @lg:py-16">
    <div class="mx-auto grid max-w-md gap-3 text-center">
      <h2 class="font-serif text-heading text-balance @md:text-heading-lg" aria-level={titleRank}>
        {title}
      </h2>
      {#if description}
        <p class="text-body text-muted-foreground">{description}</p>
      {/if}
    </div>

    {#if error}
      <Alert.Root variant="error" class="mx-auto w-full max-w-md">
        <Alert.Content>
          <Alert.Title>{error}</Alert.Title>
          <Alert.Description>Your current plan has not changed.</Alert.Description>
          <Alert.Action>
            <Button type="button" variant="outline" size="sm" {disabled} onclick={onretry}>
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
    {:else if loading}
      <div role="status" aria-busy="true" class="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6">
        <span class="sr-only">Loading plans…</span>
        {#each placeholders as key (key)}
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
        {/each}
      </div>
    {:else if plans.length === 0}
      <Card.Root variant="muted" class="mx-auto max-w-md">
        <Card.Header class="items-center text-center">
          <Card.Title aria-level={planRank}>No plans to show yet</Card.Title>
          <Card.Description>Plans appear here as soon as they are published.</Card.Description>
        </Card.Header>
      </Card.Root>
    {:else}
      <ul class="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6">
        {#each plans as plan (plan.id)}
          <li class="flex">
            <Card.Root size="sm" class={plan.highlighted ? "border-primary" : undefined}>
              <Card.Header>
                <div class="flex items-center justify-between gap-2">
                  <Card.Title aria-level={planRank}>{plan.name}</Card.Title>
                  {#if plan.badge}
                    <Badge variant="solid" size="sm">{plan.badge}</Badge>
                  {/if}
                </div>
                {#if plan.description}
                  <Card.Description>{plan.description}</Card.Description>
                {/if}
              </Card.Header>
              <Card.Content>
                <p class="flex items-baseline gap-1">
                  <span class="font-serif text-heading">{plan.price}</span>
                  {#if plan.period}
                    <span class="text-ui-md text-muted-foreground">{plan.period}</span>
                  {/if}
                </p>
                <ul class="grid gap-2 @sm:grid-cols-2 @md:grid-cols-1">
                  {#each plan.features as feature (feature)}
                    <li class="flex gap-2">
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
                      {feature}
                    </li>
                  {/each}
                </ul>
              </Card.Content>
              <Card.Footer>
                <Button
                  type="button"
                  variant={plan.highlighted ? "primary" : "outline"}
                  class="w-full"
                  {disabled}
                  aria-label={`${plan.action}: ${plan.name}`}
                  onclick={() => onselect?.(plan.id)}
                >
                  {plan.action}
                </Button>
              </Card.Footer>
            </Card.Root>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
