<script setup lang="ts">
import { Carousel } from "@moderno-ui/vue";

const slides = [1, 2, 3, 4, 5];
</script>

<template>
  <Carousel.Root :slide-count="slides.length">
    <Carousel.ItemGroup>
      <Carousel.Item v-for="(slide, index) in slides" :key="slide" :index="index">
        {{ slide }}
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
</template>
