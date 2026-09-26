<script setup lang="ts">
import { Pagination } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <Pagination.Root size="sm" :count="50" :page-size="10">
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
    <Pagination.Root size="md" :count="50" :page-size="10">
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
    <Pagination.Root size="lg" :count="50" :page-size="10">
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
  </div>
</template>
