<script setup lang="ts">
import { Progress } from "@moderno-ui/vue";
</script>

<template>
  <Progress.Root :default-value="null">
    <Progress.Label>Preparing your download</Progress.Label>
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
</template>
