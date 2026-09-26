<script setup lang="ts">
import { Avatar } from "@moderno-ui/vue";
</script>

<template>
  <Avatar.Root>
    <Avatar.Fallback>AL</Avatar.Fallback>
    <Avatar.Image src="https://api.dicebear.com/9.x/notionists/svg?seed=Ada" alt="Ada Lovelace" />
  </Avatar.Root>
</template>
