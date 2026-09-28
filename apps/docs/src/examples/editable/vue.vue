<script setup lang="ts">
import { Editable } from "@moderno-ui/vue";
</script>

<template>
  <Editable.Root default-value="Background">
    <Editable.Label>Layer name</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
</template>
