/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { RadioGroup } from "@moderno-ui/solid";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];

export function RadioGroupDemo() {
  return (
    <RadioGroup.Root defaultValue="pro">
      <RadioGroup.Label>Plan</RadioGroup.Label>
      <For each={plans}>
        {(plan) => (
          <RadioGroup.Item value={plan.value}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>{plan.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  );
}
