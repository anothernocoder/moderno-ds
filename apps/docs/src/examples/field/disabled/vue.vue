<!--
  A disabled Field — every part dims, the control is inert — @moderno-
  ui/vue.
-->
<script setup lang="ts">
import { Field } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root disabled>
    <Field.Label>Plan</Field.Label>
    <Field.Input value="Enterprise" />
    <Field.HelperText>Managed by your administrator.</Field.HelperText>
  </Field.Root>
</template>
