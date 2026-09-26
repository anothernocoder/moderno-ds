/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { RadioGroup } from "@moderno-ui/solid";

const methods = [
  { value: "card", label: "Card" },
  { value: "transfer", label: "Bank transfer" },
];

export function RadioGroupInvalidDemo() {
  return (
    <RadioGroup.Root invalid>
      <RadioGroup.Label>Payment method</RadioGroup.Label>
      <For each={methods}>
        {(method) => (
          <RadioGroup.Item value={method.value}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>{method.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  );
}
