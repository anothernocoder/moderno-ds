<script setup lang="ts">
import { Divider, Field } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-row">
    <Field.Root>
      <Field.Label>Phone</Field.Label>
      <Field.Input type="tel" placeholder="+1 555 0100" />
      <Field.HelperText>We text you a code.</Field.HelperText>
    </Field.Root>
    <Divider orientation="vertical">or</Divider>
    <Field.Root>
      <Field.Label>Email</Field.Label>
      <Field.Input type="email" placeholder="you@example.com" />
      <Field.HelperText>We email you a link.</Field.HelperText>
    </Field.Root>
  </div>
</template>
