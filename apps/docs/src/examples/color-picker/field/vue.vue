<script setup lang="ts">
import { ColorPicker, Field } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root>
    <Field.Label>Brand color</Field.Label>
    <ColorPicker default-value="#1E90FF" />
    <Field.HelperText>Used for buttons and links.</Field.HelperText>
  </Field.Root>
</template>
