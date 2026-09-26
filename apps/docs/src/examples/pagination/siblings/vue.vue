<script setup lang="ts">
import { Pagination } from "@moderno-ui/vue";
</script>

<template>
  <Pagination.Root :count="200" :page-size="10" :default-page="10" :sibling-count="2">
    <Pagination.PrevTrigger>‹</Pagination.PrevTrigger>
    <Pagination.Context v-slot="{ pages }">
      <template v-for="(page, index) in pages" :key="index">
        <Pagination.Item v-if="page.type === 'page'" v-bind="page">{{
          page.value
        }}</Pagination.Item>
        <Pagination.Ellipsis v-else :index="index">…</Pagination.Ellipsis>
      </template>
    </Pagination.Context>
    <Pagination.NextTrigger>›</Pagination.NextTrigger>
  </Pagination.Root>
</template>
