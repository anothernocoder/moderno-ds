<!--
  Divider — a bare rule, the three label alignments, and vertical rules (bare
  and captioned) — @moderno-ui/vue, the same demo every framework's example
  shows.
-->
<script setup lang="ts">
import { Divider } from "@moderno-ui/vue";
</script>

<template>
  <div class="divider-stack">
    <Divider />
    <Divider>Or continue with</Divider>
    <Divider align="start">Recent</Divider>
    <Divider align="end">Archive</Divider>
  </div>

  <div class="divider-inline">
    <span>Overview</span>
    <Divider orientation="vertical" />
    <span>Activity</span>
    <Divider orientation="vertical">or</Divider>
    <span>Settings</span>
  </div>
</template>
