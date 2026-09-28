<script setup lang="ts">
import { ref } from "vue";
import { Avatar, Button, SortableList } from "@moderno-ui/vue";

const slides = ref(["Cover", "Logo", "Colors", "Fonts"]);
const remove = (slide: string) => {
  slides.value = slides.value.filter((other) => other !== slide);
};
</script>

<template>
  <SortableList.Root v-model:items="slides" aria-label="Slides">
    <SortableList.Item v-for="slide in slides" :key="slide" :value="slide">
      <SortableList.ItemHandle />
      <Avatar.Root size="sm" shape="square">
        <Avatar.Fallback>{{ slide.slice(0, 2) }}</Avatar.Fallback>
      </Avatar.Root>
      <SortableList.ItemTrigger>{{ slide }}</SortableList.ItemTrigger>
      <Button variant="ghost" size="sm" @click="remove(slide)">Remove</Button>
    </SortableList.Item>
  </SortableList.Root>
</template>
