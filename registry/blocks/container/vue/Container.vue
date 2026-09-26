<script setup lang="ts">
import { Card } from "@moderno-ui/vue";

type ContainerSize = "sm" | "md" | "lg" | "full";

withDefaults(defineProps<{ size?: ContainerSize }>(), { size: "lg" });
</script>

<template>
  <div class="@container moderno-block-container w-full text-foreground">
    <div
      :data-size="size"
      class="mx-auto w-full px-4 py-6 data-[size=lg]:max-w-lg data-[size=md]:max-w-md data-[size=sm]:max-w-sm @sm:px-6 @md:px-8 @lg:py-10"
    >
      <slot>
        <Card.Root>
          <Card.Header>
            <Card.Title>Page content</Card.Title>
            <Card.Description>
              The container centres this card and keeps the same gutter on both sides.
            </Card.Description>
          </Card.Header>
        </Card.Root>
      </slot>
    </div>
  </div>
</template>
