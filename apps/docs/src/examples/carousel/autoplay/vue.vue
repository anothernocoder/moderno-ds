<script setup lang="ts">
import { Carousel } from "@moderno-ui/vue";

const slides = [1, 2, 3, 4, 5];
</script>

<template>
  <Carousel.Root :slide-count="slides.length" autoplay>
    <Carousel.ItemGroup>
      <Carousel.Item v-for="(slide, index) in slides" :key="slide" :index="index">
        {{ slide }}
      </Carousel.Item>
    </Carousel.ItemGroup>
    <Carousel.Control>
      <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
      <Carousel.AutoplayTrigger>
        <Carousel.AutoplayIndicator fallback="Play">Pause</Carousel.AutoplayIndicator>
      </Carousel.AutoplayTrigger>
      <Carousel.NextTrigger>›</Carousel.NextTrigger>
    </Carousel.Control>
  </Carousel.Root>
</template>
