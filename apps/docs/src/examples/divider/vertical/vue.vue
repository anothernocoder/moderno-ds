<!--
  Bare vertical Dividers between inline items — each rule takes its length
  from the row — @moderno-ui/vue.
-->
<script setup lang="ts">
import { Divider } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <span>Overview</span>
    <Divider orientation="vertical" />
    <span>Activity</span>
    <Divider orientation="vertical" />
    <span>Settings</span>
  </div>
</template>
