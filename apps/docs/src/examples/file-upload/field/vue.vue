<script setup lang="ts">
import { Field, FileUpload } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root>
    <Field.Label>Logo</Field.Label>
    <FileUpload :accept="['image/svg+xml', 'image/png']" :max-file-size="2_000_000" />
    <Field.HelperText>A square logo works best.</Field.HelperText>
  </Field.Root>
</template>
