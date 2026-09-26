<script setup lang="ts">
import { Progress } from "@moderno-ui/vue";
</script>

<template>
  <Progress.Root :default-value="70" orientation="vertical">
    <Progress.Label>Storage</Progress.Label>
    <Progress.ValueText />
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
</template>
