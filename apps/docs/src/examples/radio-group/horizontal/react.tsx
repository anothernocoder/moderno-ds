import { RadioGroup } from "@moderno-ui/react";

const periods = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function RadioGroupHorizontalDemo() {
  return (
    <RadioGroup.Root orientation="horizontal" defaultValue="monthly">
      <RadioGroup.Label>Billing</RadioGroup.Label>
      {periods.map((period) => (
        <RadioGroup.Item key={period.value} value={period.value}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{period.label}</RadioGroup.ItemText>
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
