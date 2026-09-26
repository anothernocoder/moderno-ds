import { RadioGroup } from "@moderno-ui/react";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];

export function RadioGroupDemo() {
  return (
    <RadioGroup.Root defaultValue="pro">
      <RadioGroup.Label>Plan</RadioGroup.Label>
      {plans.map((plan) => (
        <RadioGroup.Item key={plan.value} value={plan.value}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{plan.label}</RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
