<script setup lang="ts">
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
    <h2 class="text-body-lg font-semibold @md:text-heading-sm">Pricing</h2>
    <ul class="mt-6 grid gap-4 @md:grid-cols-3">
      <li
        v-for="plan in plans"
        :key="plan.name"
        class="flex flex-col rounded-lg bg-card p-6 text-card-foreground shadow-sm"
      >
        <h3 class="text-ui-md font-medium">{{ plan.name }}</h3>
        <p class="mt-1 text-heading font-semibold">{{ plan.price }}</p>
        <ul class="mt-4 grid grow gap-2 text-ui-md text-muted-foreground">
          <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
        </ul>
        <div class="mt-6">
          <Button type="button">Choose plan</Button>
        </div>
      </li>
    </ul>
  </section>
</template>
