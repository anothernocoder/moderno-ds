<script setup lang="ts">
import { Editable } from "@moderno-ui/vue";
</script>

<template>
  <Editable.Root placeholder="Untitled" :max-length="32">
    <Editable.Label>File name</Editable.Label>
    <Editable.Area>
      <Editable.Input />
      <Editable.Preview />
    </Editable.Area>
  </Editable.Root>
</template>
