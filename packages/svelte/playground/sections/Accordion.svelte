<!--
  Accordion — Ark's accordion machine over collapsible items: the open items
  (aria-expanded, data-state), each content labelled by its own trigger's id,
  the hidden contents and a disabled item reach the server string.
-->
<script lang="ts">
  import { Accordion } from "../../src/exports/accordion.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

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
