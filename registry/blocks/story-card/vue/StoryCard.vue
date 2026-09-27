<script setup lang="ts">
import { computed } from "vue";
import { Alert, Avatar, Badge, Button, Card, Skeleton } from "@moderno-ui/vue";

interface StoryImage {
  src: string;
  alt: string;
}

const props = withDefaults(
  defineProps<{
    brand?: string;
    brandInitials?: string;
    brandLogoUrl?: string;
    badge?: string;
    kicker?: string;
    title?: string;
    detail?: string;
    image?: StoryImage;
    actionLabel?: string;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    brand: "Moderno Studio",
    brandInitials: "MS",
    brandLogoUrl: undefined,
    badge: "Sponsored",
    kicker: "New collection",
    title: "Design that feels modern.",
    detail: "Hand-glazed stoneware for slow mornings. In stores Friday.",
    image: undefined,
    actionLabel: "Shop now",
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  action: [];
  retry: [];
}>();

const hasLogo = computed(() => Boolean(props.brandInitials || props.brandLogoUrl));
const isEmpty = computed(() => !props.title && !props.image);
</script>

<template>
  <article class="@container moderno-block-story-card text-foreground">
    <div class="mx-auto w-full max-w-md @lg:py-16">
      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description>
            The rest of the page still works. Try again in a moment.
          </Alert.Description>
          <Alert.Action>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="disabled"
              @click="emit('retry')"
            >
              Try again
            </Button>
          </Alert.Action>
        </Alert.Content>
      </Alert.Root>
      <div v-else-if="loading" role="status" aria-busy="true" class="relative">
        <span class="sr-only">Loading the story…</span>
        <Card.Root
          aria-hidden="true"
          class="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10"
        >
          <div class="flex items-center gap-3">
            <Skeleton shape="circle" class="w-8" />
            <Skeleton shape="text" class="w-1/3" />
          </div>
          <Skeleton shape="rect" class="h-auto min-h-0 flex-1" />
          <div class="grid gap-2 @md:gap-3">
            <Skeleton shape="text" class="w-1/3" />
            <Skeleton shape="text" class="h-8 w-3/4" />
            <Skeleton shape="text" />
          </div>
          <Skeleton shape="rect" class="h-10 w-full" />
        </Card.Root>
      </div>
      <p
        v-else-if="isEmpty"
        class="flex aspect-9/16 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-ui-md text-muted-foreground"
      >
        This story has nothing to show yet.
      </p>
      <Card.Root v-else class="aspect-9/16 gap-4 overflow-hidden p-5 @sm:p-6 @md:gap-6 @md:p-10">
        <div v-if="brand" class="flex items-center gap-3">
          <Avatar.Root v-if="hasLogo" size="sm" shape="square">
            <Avatar.Fallback>{{ brandInitials }}</Avatar.Fallback>
            <Avatar.Image v-if="brandLogoUrl" :src="brandLogoUrl" alt="" />
          </Avatar.Root>
          <p class="min-w-0 flex-1 truncate text-ui-md font-medium">{{ brand }}</p>
          <Badge v-if="badge" variant="outline" size="sm">{{ badge }}</Badge>
        </div>

        <div v-if="image" class="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-muted">
          <img :src="image.src" :alt="image.alt" class="absolute inset-0 size-full object-cover" />
        </div>

        <div class="mt-auto grid gap-2 @md:gap-3">
          <p v-if="kicker" class="text-ui-sm font-medium text-muted-foreground @md:text-ui-md">
            {{ kicker }}
          </p>
          <h3 v-if="title" class="font-serif text-heading text-balance @sm:text-heading-lg">
            {{ title }}
          </h3>
          <p v-if="detail" class="text-body text-pretty text-muted-foreground @sm:text-body-lg">
            {{ detail }}
          </p>
        </div>

        <Button
          v-if="actionLabel"
          type="button"
          size="lg"
          class="w-full"
          :disabled="disabled"
          :aria-label="title ? `${actionLabel}: ${title}` : undefined"
          @click="emit('action')"
        >
          {{ actionLabel }}
        </Button>
      </Card.Root>
    </div>
  </article>
</template>
