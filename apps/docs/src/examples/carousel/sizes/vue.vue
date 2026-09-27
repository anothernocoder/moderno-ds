<script setup lang="ts">
import { Carousel } from "@moderno-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const slides = [1, 2, 3];
</script>

<template>
  <div class="demo-stack">
    <Carousel.Root v-for="size in sizes" :key="size" :size="size" :slide-count="slides.length">
      <Carousel.ItemGroup>
        <Carousel.Item v-for="(slide, index) in slides" :key="slide" :index="index">
          {{ size }}
        </Carousel.Item>
      </Carousel.ItemGroup>
      <Carousel.Control>
        <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
        <Carousel.IndicatorGroup>
          <Carousel.Indicator v-for="(slide, index) in slides" :key="slide" :index="index" />
        </Carousel.IndicatorGroup>
        <Carousel.NextTrigger>›</Carousel.NextTrigger>
      </Carousel.Control>
    </Carousel.Root>
  </div>
</template>
