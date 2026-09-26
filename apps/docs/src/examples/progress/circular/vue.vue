<script setup lang="ts">
import { Progress } from "@moderno-ui/vue";
</script>

<template>
  <Progress.Root :default-value="75">
    <Progress.Circle>
      <Progress.CircleTrack />
      <Progress.CircleRange />
    </Progress.Circle>
    <Progress.ValueText />
  </Progress.Root>
</template>
