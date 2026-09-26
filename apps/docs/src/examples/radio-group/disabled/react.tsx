import { RadioGroup } from "@moderno-ui/react";

const options = [
  { value: "courier", label: "Courier" },
  { value: "pickup", label: "Store pickup", disabled: true },
];

export function RadioGroupDisabledDemo() {
  return (
    <RadioGroup.Root defaultValue="courier">
      <RadioGroup.Label>Delivery</RadioGroup.Label>
      {options.map((option) => (
        <RadioGroup.Item key={option.value} value={option.value} disabled={option.disabled}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
