<script setup lang="ts">
import { Editable } from "@moderno-ui/vue";
</script>

<template>
  <Editable.Root default-value="Introduction">
    <Editable.Label>Slide title</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
    <Editable.Control>
      <Editable.EditTrigger>Edit</Editable.EditTrigger>
      <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>
      <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>
    </Editable.Control>
  </Editable.Root>
</template>
