<script lang="ts">
  import { Accordion } from "../../src/index.js";
  import type {
    AccordionSize,
    AccordionValueChangeDetails,
    AccordionVariant,
  } from "../../src/index.js";

  let {
    variant = undefined,
    size = undefined,
    multiple = undefined,
    collapsible = undefined,
    defaultValue = ["shipping"],
    onValueChange = undefined,
  }: {
    variant?: AccordionVariant;
    size?: AccordionSize;
    multiple?: boolean;
    collapsible?: boolean;
    defaultValue?: string[];
    onValueChange?: (details: AccordionValueChangeDetails) => void;
  } = $props();

  const items = [
    { value: "shipping", label: "Shipping" },
    { value: "returns", label: "Returns" },
    { value: "warranty", label: "Warranty", disabled: true },
    { value: "support", label: "Support" },
  ];
</script>

<Accordion.Root
  {variant}
  {size}
  {multiple}
  {collapsible}
  {defaultValue}
  {onValueChange}
  class="faq"
>
  {#each items as item (item.value)}
    <Accordion.Item value={item.value} disabled={item.disabled}>
      <Accordion.ItemTrigger>
        {item.label}
        <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>{item.label} answer</Accordion.ItemContent>
    </Accordion.Item>
  {/each}
</Accordion.Root>
