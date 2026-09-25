<!--
  A labelled input with helper text, at the default size — @moderno-
  ui/vue.
-->
<script setup lang="ts">
import { Field } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root>
    <Field.Label>Email</Field.Label>
    <Field.Input type="email" placeholder="you@example.com" />
    <Field.HelperText>We only use it to send receipts.</Field.HelperText>
  </Field.Root>
</template>
