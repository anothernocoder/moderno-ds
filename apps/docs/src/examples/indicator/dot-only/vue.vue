<script setup lang="ts">
import { Indicator } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Indicator variant="success" aria-label="Online" />
    <Indicator variant="error" size="sm" aria-label="Offline" />
  </div>
</template>
