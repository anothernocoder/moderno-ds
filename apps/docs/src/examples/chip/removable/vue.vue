<script setup lang="ts">
import { ref } from "vue";
import { Chip } from "@moderno-ui/vue";

const tags = ref(["React", "Vue", "Svelte", "Solid"]);
</script>

<template>
  <div class="demo-row">
    <Chip
      v-for="tag in tags"
      :key="tag"
      removable
      :remove-label="`Remove ${tag}`"
      @remove="tags = tags.filter((t) => t !== tag)"
    >
      {{ tag }}
    </Chip>
  </div>
</template>
