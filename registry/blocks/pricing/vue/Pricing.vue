<script setup lang="ts">
// Pricing — an ejected block that composes @moderno-ui/vue primitives (Button)
// into a three-plan pricing section. Copy it into your project and edit the
// plans array freely. Themed via CSS variables from the design system; no
// hardcoded colors, radii, or fonts live here.
//
// Responsive to its *container*, not the viewport (ADR-0005): the root declares
// `@container`, and the plan grid goes one-up → three-up at `@md`, the
// `--container-md` step of the token contract. Drop this block in a sidebar and
// it stacks; drop it in a page and it spreads — with no viewport media query,
// so it never has to know where it was mounted.
import { Button } from "@moderno-ui/vue";

const plans = [
  { name: "Starter", price: "$0/mo", features: ["1 project", "Community support", "1 GB storage"] },
  {
    name: "Pro",
    price: "$29/mo",
    features: ["Unlimited projects", "Email support", "50 GB storage"],
  },
  {
    name: "Scale",
    price: "$99/mo",
    features: ["Unlimited projects", "Priority support", "1 TB storage"],
  },
];
</script>

<template>
  <section class="@container moderno-block-pricing text-foreground">
    <h2 class="text-lg font-semibold @md:text-xl">Pricing</h2>
    <ul class="mt-6 grid gap-4 @md:grid-cols-3">
      <li
        v-for="plan in plans"
        :key="plan.name"
        class="flex flex-col rounded-lg bg-card p-6 text-card-foreground shadow-sm"
      >
        <h3 class="text-sm font-medium">{{ plan.name }}</h3>
        <p class="mt-1 text-2xl font-semibold">{{ plan.price }}</p>
        <ul class="mt-4 grid grow gap-2 text-sm text-muted-foreground">
          <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
        </ul>
        <div class="mt-6">
          <Button type="button">Choose plan</Button>
        </div>
      </li>
    </ul>
  </section>
</template>
