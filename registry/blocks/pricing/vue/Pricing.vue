<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/vue";

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

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    plans?: PricingPlan[];
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    title: "Pricing that grows with you",
    description:
      "Start free, then pick the plan that fits how your team works. Change or cancel at any time.",
    plans: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  select: [id: string];
  retry: [];
}>();

const resolvedPlans = computed(() => props.plans ?? samplePlans);
</script>

<template>
  <section class="@container moderno-block-pricing text-foreground">
    <div class="grid gap-8 py-12 @lg:gap-10 @lg:py-16">
      <div class="mx-auto grid max-w-md gap-3 text-center">
        <h2 class="font-serif text-heading text-balance @md:text-heading-lg">{{ title }}</h2>
        <p v-if="description" class="text-body text-muted-foreground">{{ description }}</p>
      </div>

      <Alert.Root v-if="error" variant="error" class="mx-auto w-full max-w-md">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>Your current plan has not changed.</Alert.Description>
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
        class="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6"
      >
        <span class="sr-only">Loading plans…</span>
        <Card.Root v-for="key in placeholders" :key="key" size="sm" aria-hidden="true">
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
      </div>

      <Card.Root v-else-if="resolvedPlans.length === 0" variant="muted" class="mx-auto max-w-md">
        <Card.Header class="items-center text-center">
          <Card.Title>No plans to show yet</Card.Title>
          <Card.Description>Plans appear here as soon as they are published.</Card.Description>
        </Card.Header>
      </Card.Root>

      <ul v-else class="grid gap-4 @md:auto-cols-fr @md:grid-flow-col @lg:gap-6">
        <li v-for="plan in resolvedPlans" :key="plan.id" class="flex">
          <Card.Root size="sm" :class="plan.highlighted ? 'border-primary' : undefined">
            <Card.Header>
              <div class="flex items-center justify-between gap-2">
                <Card.Title>{{ plan.name }}</Card.Title>
                <Badge v-if="plan.badge" variant="solid" size="sm">{{ plan.badge }}</Badge>
              </div>
              <Card.Description v-if="plan.description">{{ plan.description }}</Card.Description>
            </Card.Header>
            <Card.Content>
              <p class="flex items-baseline gap-1">
                <span class="font-serif text-heading">{{ plan.price }}</span>
                <span v-if="plan.period" class="text-ui-md text-muted-foreground">
                  {{ plan.period }}
                </span>
              </p>
              <ul class="grid gap-2 @sm:grid-cols-2 @md:grid-cols-1">
                <li v-for="feature in plan.features" :key="feature" class="flex gap-2">
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
                  {{ feature }}
                </li>
              </ul>
            </Card.Content>
            <Card.Footer>
              <Button
                type="button"
                :variant="plan.highlighted ? 'primary' : 'outline'"
                class="w-full"
                :disabled="disabled"
                :aria-label="`${plan.action}: ${plan.name}`"
                @click="emit('select', plan.id)"
              >
                {{ plan.action }}
              </Button>
            </Card.Footer>
          </Card.Root>
        </li>
      </ul>
    </div>
  </section>
</template>
