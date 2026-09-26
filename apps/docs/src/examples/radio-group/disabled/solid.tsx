/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { RadioGroup } from "@moderno-ui/solid";

const options = [
  { value: "courier", label: "Courier" },
  { value: "pickup", label: "Store pickup", disabled: true },
];

export function RadioGroupDisabledDemo() {
  return (
    <RadioGroup.Root defaultValue="courier">
      <RadioGroup.Label>Delivery</RadioGroup.Label>
      <For each={options}>
        {(option) => (
          <RadioGroup.Item value={option.value} disabled={option.disabled}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  );
}
