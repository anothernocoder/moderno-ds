<!--
  Button across its variants and sizes — @moderno-ui/vue, the same demo every
  framework's example shows. Painted by @moderno-ui/css from the active theme;
  no styling in this file.
-->
<script setup lang="ts">
import { Button } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
  </div>
  <div class="demo-row">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
</template>
