<script setup lang="ts">
import { Carousel } from "@moderno-ui/vue";

const slides = [1, 2, 3, 4, 5, 6];
</script>

<template>
  <Carousel.Root :slide-count="slides.length" :slides-per-page="2" spacing="var(--spacing-3)">
    <Carousel.ItemGroup>
      <Carousel.Item v-for="(slide, index) in slides" :key="slide" :index="index">
        {{ slide }}
      </Carousel.Item>
    </Carousel.ItemGroup>
    <Carousel.Control>
      <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
      <Carousel.Context v-slot="{ pageSnapPoints }">
        <Carousel.IndicatorGroup>
          <Carousel.Indicator v-for="(_, index) in pageSnapPoints" :key="index" :index="index" />
        </Carousel.IndicatorGroup>
      </Carousel.Context>
      <Carousel.NextTrigger>›</Carousel.NextTrigger>
    </Carousel.Control>
  </Carousel.Root>
</template>
