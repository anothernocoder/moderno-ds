<script setup lang="ts">
import { Pagination } from "@moderno-ui/vue";
</script>

<template>
  <Pagination.Root :count="120" :page-size="10" :default-page="6">
    <Pagination.FirstTrigger>«</Pagination.FirstTrigger>
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
    <Pagination.LastTrigger>»</Pagination.LastTrigger>
  </Pagination.Root>
</template>
