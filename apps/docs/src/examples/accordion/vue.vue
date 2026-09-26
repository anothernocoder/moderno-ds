<script setup lang="ts">
import { Accordion } from "@moderno-ui/vue";
</script>

<template>
  <Accordion.Root :default-value="['shipping']" collapsible>
    <Accordion.Item value="shipping">
      <Accordion.ItemTrigger>
        How long does shipping take?
        <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>Three to five working days.</Accordion.ItemContent>
    </Accordion.Item>
    <Accordion.Item value="returns">
      <Accordion.ItemTrigger>
        Can I return an order?
        <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>Yes, within 30 days of delivery.</Accordion.ItemContent>
    </Accordion.Item>
    <Accordion.Item value="support">
      <Accordion.ItemTrigger>
        How do I reach support?
        <Accordion.ItemIndicator>▾</Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>Write to us from the help page.</Accordion.ItemContent>
    </Accordion.Item>
  </Accordion.Root>
</template>
