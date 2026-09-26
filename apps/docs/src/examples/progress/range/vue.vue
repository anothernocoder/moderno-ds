<script setup lang="ts">
import { Progress } from "@moderno-ui/vue";
</script>

<template>
  <Progress.Root :default-value="3" :max="5">
    <Progress.Label>Profile setup</Progress.Label>
    <Progress.ValueText>3 of 5 steps</Progress.ValueText>
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
</template>
