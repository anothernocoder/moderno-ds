<script setup lang="ts">
import { Field } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Field.Root size="sm">
      <Field.Label>Small</Field.Label>
      <Field.Input placeholder="sm" />
    </Field.Root>
    <Field.Root size="md">
      <Field.Label>Medium</Field.Label>
      <Field.Input placeholder="md" />
    </Field.Root>
    <Field.Root size="lg">
      <Field.Label>Large</Field.Label>
      <Field.Input placeholder="lg" />
    </Field.Root>
  </div>
</template>
