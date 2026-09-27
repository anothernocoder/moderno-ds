<script setup lang="ts">
import { Editable } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Editable.Root size="sm" default-value="Layer 1">
      <Editable.Label>Small</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
    <Editable.Root size="md" default-value="Layer 2">
      <Editable.Label>Medium</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
    <Editable.Root size="lg" default-value="Layer 3">
      <Editable.Label>Large</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  </div>
</template>
