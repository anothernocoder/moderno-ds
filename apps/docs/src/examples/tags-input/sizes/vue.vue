<script setup lang="ts">
import { TagsInput } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <TagsInput.Root size="sm" :default-value="['React']">
      <TagsInput.Label>Small</TagsInput.Label>
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
        <TagsInput.Input />
      </TagsInput.Control>
    </TagsInput.Root>
    <TagsInput.Root size="md" :default-value="['React']">
      <TagsInput.Label>Medium</TagsInput.Label>
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
        <TagsInput.Input />
      </TagsInput.Control>
    </TagsInput.Root>
    <TagsInput.Root size="lg" :default-value="['React']">
      <TagsInput.Label>Large</TagsInput.Label>
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
        <TagsInput.Input />
      </TagsInput.Control>
    </TagsInput.Root>
  </div>
</template>
