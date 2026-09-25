<script setup lang="ts">
import { Field } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root invalid>
    <Field.Label>Workspace URL</Field.Label>
    <Field.Input placeholder="acme" value="not a url" />
    <Field.ErrorText>Use lowercase letters, numbers and dashes.</Field.ErrorText>
  </Field.Root>
</template>
