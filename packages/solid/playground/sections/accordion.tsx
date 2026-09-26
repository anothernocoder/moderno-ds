/**
 * Accordion — Ark's accordion machine over collapsible items: trigger and
 * content ids wired by aria-controls / aria-labelledby, the open items
 * (aria-expanded, data-state), the hidden contents and a disabled item must
 * reach the server.
 */
import { Accordion } from "../../src/accordion.jsx";
import type { Section } from "../section.js";

const AccordionSection: Section = () => (
  <section aria-label="accordion">
    <Accordion.Root defaultValue={["shipping"]}>
      <Accordion.Item value="shipping">
        <Accordion.ItemTrigger>
          Shipping
          <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>Shipping answer</Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.ItemTrigger>
          Returns
          <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>Returns answer</Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
    <Accordion.Root variant="enclosed" size="sm" multiple defaultValue={["support"]}>
      <Accordion.Item value="warranty" disabled>
        <Accordion.ItemTrigger>
          Warranty
          <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>Warranty answer</Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="support">
        <Accordion.ItemTrigger>
          Support
          <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>Support answer</Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  </section>
);

export default AccordionSection;
