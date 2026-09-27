<script setup lang="ts">
import { computed } from "vue";
import { Alert, Badge, Button, Card, Skeleton } from "@moderno-ui/vue";

interface ProductImage {
  src: string;
  alt: string;
}

interface Product {
  name: string;
  price: string;
  compareAtPrice?: string;
  description?: string;
  badge?: string;
  href?: string;
  image?: ProductImage;
}

const sampleProduct: Product = {
  name: "Stoneware mug",
  price: "€28",
  compareAtPrice: "€35",
  description: "Glazed by hand in small batches. Holds 350 ml and goes in the dishwasher.",
  badge: "Sale",
  href: "#",
};

const props = withDefaults(
  defineProps<{
    product?: Product | null;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    product: undefined,
    error: undefined,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  addToCart: [];
  retry: [];
}>();

const shown = computed(() => (props.product === undefined ? sampleProduct : props.product));
</script>

<template>
  <article class="@container moderno-block-product-card text-foreground">
    <div class="mx-auto w-full max-w-lg">
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
        <span class="sr-only">Loading the product…</span>
        <Card.Root
          aria-hidden="true"
          class="overflow-hidden @sm:grid @sm:grid-cols-5 @sm:grid-rows-[auto_1fr_auto] @lg:grid-cols-2 @lg:grid-rows-[1fr_auto_1fr]"
        >
          <div
            class="relative aspect-square bg-muted @sm:col-span-2 @sm:row-span-3 @sm:aspect-auto @lg:col-span-1 @lg:aspect-square"
          >
            <Skeleton shape="rect" class="absolute inset-0 size-full rounded-none" />
          </div>
          <Card.Header class="gap-3 @sm:col-span-3 @lg:col-span-1 @lg:self-end">
            <Skeleton shape="text" class="w-2/3" />
            <Skeleton shape="text" />
            <Skeleton shape="text" class="w-1/2" />
          </Card.Header>
          <Card.Content class="@sm:col-span-3 @lg:col-span-1">
            <Skeleton shape="text" class="w-1/4" />
          </Card.Content>
          <Card.Footer class="@sm:col-span-3 @lg:col-span-1 @lg:self-start">
            <Skeleton shape="rect" class="h-10 w-full @sm:w-32" />
          </Card.Footer>
        </Card.Root>
      </div>
      <p
        v-else-if="!shown"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        This product is no longer available.
      </p>
      <Card.Root
        v-else
        class="overflow-hidden @sm:grid @sm:grid-cols-5 @sm:grid-rows-[auto_1fr_auto] @lg:grid-cols-2 @lg:grid-rows-[1fr_auto_1fr]"
      >
        <div
          class="relative aspect-square bg-muted @sm:col-span-2 @sm:row-span-3 @sm:aspect-auto @lg:col-span-1 @lg:aspect-square"
        >
          <img
            v-if="shown.image"
            :src="shown.image.src"
            :alt="shown.image.alt"
            class="absolute inset-0 size-full object-cover"
          />
          <Badge v-if="shown.badge" variant="solid" class="absolute start-3 top-3">{{
            shown.badge
          }}</Badge>
        </div>
        <Card.Header class="gap-2 @sm:col-span-3 @lg:col-span-1 @lg:self-end">
          <Card.Title class="text-body-lg text-balance @md:text-heading-sm">
            <a
              v-if="shown.href"
              class="rounded-sm text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:no-underline"
              :href="disabled ? undefined : shown.href"
              :role="disabled ? 'link' : undefined"
              :aria-disabled="disabled || undefined"
              >{{ shown.name }}</a
            >
            <template v-else>{{ shown.name }}</template>
          </Card.Title>
          <Card.Description v-if="shown.description" class="text-pretty">{{
            shown.description
          }}</Card.Description>
        </Card.Header>
        <Card.Content class="@sm:col-span-3 @lg:col-span-1">
          <p class="relative flex flex-wrap items-baseline gap-x-2">
            <span class="text-body-lg font-semibold tabular-nums">{{ shown.price }}</span>
            <s v-if="shown.compareAtPrice" class="text-ui-md text-muted-foreground tabular-nums"
              ><span class="sr-only">Was</span> {{ shown.compareAtPrice }}</s
            >
          </p>
        </Card.Content>
        <Card.Footer class="@sm:col-span-3 @lg:col-span-1 @lg:self-start">
          <Button
            type="button"
            class="w-full @sm:w-auto"
            :disabled="disabled"
            :aria-label="`Add to cart: ${shown.name}`"
            @click="emit('addToCart')"
          >
            Add to cart
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
  </article>
</template>
