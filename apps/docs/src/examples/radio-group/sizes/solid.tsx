/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { RadioGroup } from "@moderno-ui/solid";

const sizes = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
] as const;

export function RadioGroupSizesDemo() {
  return (
    <div class="demo-row">
      <For each={sizes}>
        {(size) => (
          <RadioGroup.Root size={size.value} defaultValue="yes">
            <RadioGroup.Label>{size.label}</RadioGroup.Label>
            <RadioGroup.Item value="yes">
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>Yes</RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
            <RadioGroup.Item value="no">
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>No</RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          </RadioGroup.Root>
        )}
      </For>
    </div>
  );
}
