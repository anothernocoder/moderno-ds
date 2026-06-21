<script lang="ts">
  // Pricing — an ejected block that composes @moderno/svelte primitives
  // (Button) into a three-plan pricing section. Copy it into your project and
  // edit the plans array freely. Themed via CSS variables from the design
  // system; no hardcoded colors, radii, or fonts live here.
  import { Button } from "@moderno/svelte";

  const plans = [
    { name: "Starter", price: "$0/mo", features: ["1 project", "Community support", "1 GB storage"] },
    { name: "Pro", price: "$29/mo", features: ["Unlimited projects", "Email support", "50 GB storage"] },
    { name: "Scale", price: "$99/mo", features: ["Unlimited projects", "Priority support", "1 TB storage"] },
  ];
</script>

<section class="moderno-block-pricing">
  <h2>Pricing</h2>
  <ul>
    {#each plans as plan (plan.name)}
      <li>
        <h3>{plan.name}</h3>
        <p>{plan.price}</p>
        <ul>
          {#each plan.features as feature (feature)}
            <li>{feature}</li>
          {/each}
        </ul>
        <Button type="button">Choose plan</Button>
      </li>
    {/each}
  </ul>
</section>
