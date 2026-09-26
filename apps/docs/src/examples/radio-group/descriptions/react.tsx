import { RadioGroup } from "@moderno-ui/react";

const speeds = [
  { value: "standard", label: "Standard", description: "3–5 business days" },
  { value: "express", label: "Express", description: "1–2 business days" },
  { value: "overnight", label: "Overnight", description: "Next business day" },
];

export function RadioGroupDescriptionsDemo() {
  return (
    <RadioGroup.Root defaultValue="standard">
      <RadioGroup.Label>Shipping</RadioGroup.Label>
      {speeds.map((speed) => (
        <RadioGroup.Item key={speed.value} value={speed.value}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>
            {speed.label}
            <RadioGroup.ItemDescription>{speed.description}</RadioGroup.ItemDescription>
          </RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
