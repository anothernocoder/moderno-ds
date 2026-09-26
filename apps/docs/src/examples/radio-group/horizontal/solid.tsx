/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { RadioGroup } from "@moderno-ui/solid";

const periods = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function RadioGroupHorizontalDemo() {
  return (
    <RadioGroup.Root orientation="horizontal" defaultValue="monthly">
      <RadioGroup.Label>Billing</RadioGroup.Label>
      <For each={periods}>
        {(period) => (
          <RadioGroup.Item value={period.value}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>{period.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  );
}
