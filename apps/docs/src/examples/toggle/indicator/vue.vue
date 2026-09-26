<script setup lang="ts">
import { Toggle } from "@moderno-ui/vue";
</script>

<template>
  <Toggle.Root>
    <Toggle.Indicator>
      ★
      <template #fallback>☆</template>
    </Toggle.Indicator>
    Favorite
  </Toggle.Root>
</template>
