import { For } from "solid-js";
import { Button } from "@moderno-ui/solid";

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

export function Pricing() {
  return (
    <section class="@container moderno-block-pricing text-foreground">
      <h2 class="text-lg font-semibold @md:text-xl">Pricing</h2>
      <ul class="mt-6 grid gap-4 @md:grid-cols-3">
        <For each={plans}>
          {(plan) => (
            <li class="flex flex-col rounded-lg bg-card p-6 text-card-foreground shadow-sm">
              <h3 class="text-sm font-medium">{plan.name}</h3>
              <p class="mt-1 text-2xl font-semibold">{plan.price}</p>
              <ul class="mt-4 grid grow gap-2 text-sm text-muted-foreground">
                <For each={plan.features}>{(feature) => <li>{feature}</li>}</For>
              </ul>
              <div class="mt-6">
                <Button type="button">Choose plan</Button>
              </div>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
