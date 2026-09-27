<script setup lang="ts">
import { Editable, Field } from "@moderno-ui/vue";
</script>

<template>
  <Field.Root>
    <Field.Label>Slide title</Field.Label>
    <Editable.Root default-value="Introduction">
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
    <Field.HelperText>Shown in the outline.</Field.HelperText>
  </Field.Root>
</template>
