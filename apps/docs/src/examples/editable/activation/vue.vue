<script setup lang="ts">
import { Editable } from "@moderno-ui/vue";
</script>

<template>
  <Editable.Root default-value="Voice-over" activation-mode="click">
    <Editable.Label>Track name</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
</template>
