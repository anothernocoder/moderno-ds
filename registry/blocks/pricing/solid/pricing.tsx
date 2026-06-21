import { For } from "solid-js";
import { Button } from "@moderno/solid";

/**
 * Pricing — an ejected block that composes @moderno/solid primitives
 * (Button) into a three-plan pricing section. Copy it into your project and
 * edit the plans array freely. Themed via CSS variables from the design
 * system; no hardcoded colors, radii, or fonts live here.
 */
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
    <section class="moderno-block-pricing">
      <h2>Pricing</h2>
      <ul>
        <For each={plans}>
          {(plan) => (
            <li>
              <h3>{plan.name}</h3>
              <p>{plan.price}</p>
              <ul>
                <For each={plan.features}>{(feature) => <li>{feature}</li>}</For>
              </ul>
              <Button type="button">Choose plan</Button>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
