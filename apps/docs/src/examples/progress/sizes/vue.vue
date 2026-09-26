<script setup lang="ts">
import { Progress } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <Progress.Root size="sm" :default-value="25">
      <Progress.Label>Small</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
    <Progress.Root size="md" :default-value="50">
      <Progress.Label>Medium</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
    <Progress.Root size="lg" :default-value="75">
      <Progress.Label>Large</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  </div>
</template>
