<script setup lang="ts">
import { Field } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root>
    <Field.Label>Bio</Field.Label>
    <Field.Textarea placeholder="Tell us about yourself" />
    <Field.HelperText>A few sentences is plenty.</Field.HelperText>
  </Field.Root>
</template>
