import { RadioGroup } from "@moderno-ui/react";

const methods = [
  { value: "card", label: "Card" },
  { value: "transfer", label: "Bank transfer" },
];

export function RadioGroupInvalidDemo() {
  return (
    <RadioGroup.Root invalid>
      <RadioGroup.Label>Payment method</RadioGroup.Label>
      {methods.map((method) => (
        <RadioGroup.Item key={method.value} value={method.value}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{method.label}</RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
