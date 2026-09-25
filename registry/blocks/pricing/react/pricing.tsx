import { Button } from "@moderno-ui/react";

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
    <section className="@container moderno-block-pricing text-foreground">
      <h2 className="text-body-lg font-semibold @md:text-heading-sm">Pricing</h2>
      <ul className="mt-6 grid gap-4 @md:grid-cols-3">
        {plans.map((plan) => (
          <li
            key={plan.name}
            className="flex flex-col rounded-lg bg-card p-6 text-card-foreground shadow-sm"
          >
            <h3 className="text-ui-md font-medium">{plan.name}</h3>
            <p className="mt-1 text-heading font-semibold">{plan.price}</p>
            <ul className="mt-4 grid grow gap-2 text-ui-md text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Button type="button">Choose plan</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
