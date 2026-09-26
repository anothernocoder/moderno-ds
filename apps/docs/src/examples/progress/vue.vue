<script setup lang="ts">
import { Progress } from "@moderno-ui/vue";
</script>

<template>
  <Progress.Root :default-value="60">
    <Progress.Label>Uploading photos</Progress.Label>
    <Progress.ValueText />
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
</template>
