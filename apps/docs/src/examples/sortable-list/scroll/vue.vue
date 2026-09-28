<script setup lang="ts">
import { ref } from "vue";
import { SortableList } from "@moderno-ui/vue";

const slides = ref([
  "Cover",
  "Agenda",
  "Logo",
  "Colors",
  "Fonts",
  "Icons",
  "Photos",
  "Tone of voice",
  "Layouts",
  "Contact",
]);
</script>

<template>
  <SortableList.Root
    v-model:items="slides"
    style="max-height: 12rem; overflow-y: auto"
    aria-label="Slides"
  >
    <SortableList.Item v-for="slide in slides" :key="slide" :value="slide">
      <SortableList.ItemHandle />
      <SortableList.ItemTrigger>{{ slide }}</SortableList.ItemTrigger>
    </SortableList.Item>
  </SortableList.Root>
</template>
