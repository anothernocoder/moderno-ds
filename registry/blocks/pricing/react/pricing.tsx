import { Button } from "@moderno/react";

/**
 * Pricing — an ejected block that composes @moderno/react primitives
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
    <section className="moderno-block-pricing">
      <h2>Pricing</h2>
      <ul>
        {plans.map((plan) => (
          <li key={plan.name}>
            <h3>{plan.name}</h3>
            <p>{plan.price}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Button type="button">Choose plan</Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
