import { Accordion } from "@moderno-ui/react";

export function AccordionSizesDemo() {
  return (
    <div className="demo-stack">
      <Accordion.Root size="sm">
        <Accordion.Item value="plans">
          <Accordion.ItemTrigger>
            Which plan is right for me?
            <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>Start free and upgrade when you need more.</Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="billing">
          <Accordion.ItemTrigger>
            When am I billed?
            <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>On the first day of each month.</Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
      <Accordion.Root size="md">
        <Accordion.Item value="plans">
          <Accordion.ItemTrigger>
            Which plan is right for me?
            <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>Start free and upgrade when you need more.</Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="billing">
          <Accordion.ItemTrigger>
            When am I billed?
            <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>On the first day of each month.</Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
      <Accordion.Root size="lg">
        <Accordion.Item value="plans">
          <Accordion.ItemTrigger>
            Which plan is right for me?
            <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>Start free and upgrade when you need more.</Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="billing">
          <Accordion.ItemTrigger>
            When am I billed?
            <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>On the first day of each month.</Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
