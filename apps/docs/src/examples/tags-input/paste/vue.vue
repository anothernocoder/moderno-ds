<script setup lang="ts">
import { TagsInput } from "@moderno-ui/vue";
</script>

<template>
  <TagsInput.Root add-on-paste>
    <TagsInput.Label>Colors</TagsInput.Label>
    <TagsInput.Control>
      <TagsInput.Context v-slot="{ value }">
        <TagsInput.Item v-for="(tag, index) in value" :key="index" :index="index" :value="tag">
          <TagsInput.ItemPreview>
            <TagsInput.ItemText>{{ tag }}</TagsInput.ItemText>
            <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>
          </TagsInput.ItemPreview>
          <TagsInput.ItemInput />
        </TagsInput.Item>
      </TagsInput.Context>
      <TagsInput.Input placeholder="Paste red, green, blue" />
    </TagsInput.Control>
  </TagsInput.Root>
</template>
