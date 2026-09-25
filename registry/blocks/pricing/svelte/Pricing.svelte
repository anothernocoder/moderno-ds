<script lang="ts">
  import { Button } from "@moderno-ui/svelte";

  const plans = [
    { name: "Starter", price: "$0/mo", features: ["1 project", "Community support", "1 GB storage"] },
    { name: "Pro", price: "$29/mo", features: ["Unlimited projects", "Email support", "50 GB storage"] },
    { name: "Scale", price: "$99/mo", features: ["Unlimited projects", "Priority support", "1 TB storage"] },
  ];
</script>

<section class="@container moderno-block-pricing text-foreground">
  <h2 class="text-lg font-semibold @md:text-xl">Pricing</h2>
  <ul class="mt-6 grid gap-4 @md:grid-cols-3">
    {#each plans as plan (plan.name)}
      <li class="flex flex-col rounded-lg bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="text-sm font-medium">{plan.name}</h3>
        <p class="mt-1 text-2xl font-semibold">{plan.price}</p>
        <ul class="mt-4 grid grow gap-2 text-sm text-muted-foreground">
          {#each plan.features as feature (feature)}
            <li>{feature}</li>
          {/each}
        </ul>
        <div class="mt-6">
          <Button type="button">Choose plan</Button>
        </div>
      </li>
    {/each}
  </ul>
</section>
