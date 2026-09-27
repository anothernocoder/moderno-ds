<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Alert,
  Button,
  Carousel,
  NumberInput,
  RadioGroup,
  Skeleton,
  Spinner,
  Tabs,
} from "@moderno-ui/vue";

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductOptionValue {
  value: string;
  label: string;
  soldOut?: boolean;
}

interface ProductOption {
  name: string;
  values: ProductOptionValue[];
}

interface ProductSection {
  title: string;
  body: string;
}

interface Product {
  name: string;
  price: string;
  compareAtPrice?: string;
  description?: string;
  images?: ProductImage[];
  options?: ProductOption[];
  sections?: ProductSection[];
  maxQuantity?: number;
}

interface ProductSelection {
  options: Record<string, string>;
  quantity: number;
}

const sampleProduct: Product = {
  name: "Stoneware mug",
  price: "€28",
  description:
    "Thrown and glazed by hand in small batches, so no two are quite the same. A wide handle and a heavy base keep it steady on the desk.",
  options: [
    {
      name: "Colour",
      values: [
        { value: "sage", label: "Sage" },
        { value: "oat", label: "Oat" },
        { value: "charcoal", label: "Charcoal", soldOut: true },
      ],
    },
    {
      name: "Size",
      values: [
        { value: "250", label: "250 ml" },
        { value: "350", label: "350 ml" },
        { value: "450", label: "450 ml" },
      ],
    },
  ],
  sections: [
    {
      title: "Details",
      body: "Stoneware, glazed inside and out. The foot is left bare, so you feel the clay.",
    },
    {
      title: "Care",
      body: "Safe in the dishwasher and the microwave. Avoid sudden changes of temperature.",
    },
    {
      title: "Shipping",
      body: "Ships in 2–3 working days. Free returns within 30 days.",
    },
  ],
};

const defaultMaxQuantity = 99;

const wholeNumberFormat: Intl.NumberFormatOptions = {
  maximumFractionDigits: 0,
  useGrouping: false,
};

function isValidQuantity(quantity: number, maxQuantity = defaultMaxQuantity) {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
}

function firstAvailableValue(option: ProductOption) {
  return option.values.find((value) => !value.soldOut)?.value;
}

const props = withDefaults(
  defineProps<{
    product?: Product | null;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    adding?: boolean;
  }>(),
  {
    product: undefined,
    error: undefined,
    loading: false,
    disabled: false,
    adding: false,
  },
);

const emit = defineEmits<{
  addToCart: [selection: ProductSelection];
  retry: [];
}>();

const picked = ref<Record<string, string>>({});
const quantity = ref(1);

const shownProduct = computed(() => (props.product === undefined ? sampleProduct : props.product));
const images = computed(() => shownProduct.value?.images ?? []);
const options = computed(() => shownProduct.value?.options ?? []);
const sections = computed(() => shownProduct.value?.sections ?? []);
const soldOut = computed(() =>
  options.value.some((option) => firstAvailableValue(option) === undefined),
);

function pick(option: ProductOption, value: string | null) {
  if (value) picked.value = { ...picked.value, [option.name]: value };
}

function changeQuantity(value: number) {
  if (isValidQuantity(value, shownProduct.value?.maxQuantity)) quantity.value = value;
}

function addToCart() {
  const chosen = options.value.map((option) => [
    option.name,
    picked.value[option.name] ?? firstAvailableValue(option) ?? "",
  ]);
  emit("addToCart", { options: Object.fromEntries(chosen), quantity: quantity.value });
}
</script>

<template>
  <section class="@container moderno-block-product-details text-foreground">
    <div class="px-4 py-12 @lg:py-16">
      <Alert.Root v-if="error" variant="error">
        <Alert.Content>
          <Alert.Title>{{ error }}</Alert.Title>
          <Alert.Description
            >The rest of the page still works. Try again in a moment.</Alert.Description
          >
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
        <div aria-hidden="true" class="grid gap-8 @lg:grid-cols-2 @lg:gap-10">
          <Skeleton shape="rect" class="aspect-square h-auto rounded-lg" />
          <div class="grid content-start gap-6">
            <div class="grid gap-3">
              <Skeleton shape="text" class="w-2/3" />
              <Skeleton shape="text" class="w-1/4" />
            </div>
            <div class="grid gap-2">
              <Skeleton shape="text" />
              <Skeleton shape="text" class="w-5/6" />
            </div>
            <Skeleton shape="rect" class="h-16 w-2/3" />
            <Skeleton shape="rect" class="h-10" />
          </div>
        </div>
      </div>
      <p
        v-else-if="!shownProduct"
        class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-ui-md text-muted-foreground"
      >
        This product is no longer available.
      </p>
      <div v-else class="grid gap-8 @lg:grid-cols-2 @lg:items-start @lg:gap-10">
        <Carousel.Root
          v-if="images.length > 0"
          :slide-count="images.length"
          :aria-label="`Photos of ${shownProduct.name}`"
        >
          <Carousel.ItemGroup>
            <Carousel.Item v-for="(image, index) in images" :key="index" :index="index">
              <div class="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  :src="image.src"
                  :alt="image.alt"
                  class="absolute inset-0 size-full object-cover"
                />
              </div>
            </Carousel.Item>
          </Carousel.ItemGroup>
          <Carousel.Control v-if="images.length > 1">
            <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
            <Carousel.IndicatorGroup>
              <Carousel.Indicator v-for="(_, index) in images" :key="index" :index="index" />
            </Carousel.IndicatorGroup>
            <Carousel.NextTrigger>›</Carousel.NextTrigger>
          </Carousel.Control>
        </Carousel.Root>
        <div v-else class="aspect-square rounded-lg bg-muted" />

        <div class="grid content-start gap-6">
          <div class="grid gap-2">
            <h2 class="font-serif text-heading-sm text-balance @md:text-heading">
              {{ shownProduct.name }}
            </h2>
            <p class="flex flex-wrap items-baseline gap-x-2">
              <span class="text-body-lg font-semibold tabular-nums">{{ shownProduct.price }}</span>
              <s
                v-if="shownProduct.compareAtPrice"
                class="text-ui-md text-muted-foreground tabular-nums"
              >
                <span class="sr-only">Was</span> {{ shownProduct.compareAtPrice }}
              </s>
            </p>
          </div>

          <p v-if="shownProduct.description" class="text-body text-pretty text-muted-foreground">
            {{ shownProduct.description }}
          </p>

          <RadioGroup.Root
            v-for="option in options"
            :key="option.name"
            orientation="horizontal"
            :default-value="firstAvailableValue(option)"
            :disabled="disabled"
            @value-change="pick(option, $event.value)"
          >
            <RadioGroup.Label>{{ option.name }}</RadioGroup.Label>
            <RadioGroup.Item
              v-for="value in option.values"
              :key="value.value"
              :value="value.value"
              :disabled="value.soldOut"
            >
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>
                {{ value.label }}
                <RadioGroup.ItemDescription v-if="value.soldOut"
                  >Sold out</RadioGroup.ItemDescription
                >
              </RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          </RadioGroup.Root>

          <div class="grid gap-3 @sm:flex @sm:items-end">
            <NumberInput.Root
              class="@sm:w-32 @sm:shrink-0"
              default-value="1"
              :min="1"
              :max="shownProduct.maxQuantity ?? defaultMaxQuantity"
              :format-options="wholeNumberFormat"
              :disabled="disabled || soldOut"
              @value-change="changeQuantity($event.valueAsNumber)"
            >
              <NumberInput.Label>Quantity</NumberInput.Label>
              <NumberInput.Control>
                <NumberInput.Input class="w-full" />
                <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
                <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
              </NumberInput.Control>
            </NumberInput.Root>
            <Button
              type="button"
              class="@sm:flex-1"
              :disabled="disabled || adding || soldOut"
              :aria-busy="adding || undefined"
              @click="addToCart"
            >
              <template v-if="adding">
                <Spinner size="sm" aria-hidden="true" />
                Adding
              </template>
              <template v-else-if="soldOut">Sold out</template>
              <template v-else>Add to cart</template>
            </Button>
          </div>

          <Tabs.Root v-if="sections.length > 0" default-value="0">
            <Tabs.List :aria-label="`About ${shownProduct.name}`">
              <Tabs.Trigger
                v-for="(section, index) in sections"
                :key="index"
                :value="String(index)"
              >
                {{ section.title }}
              </Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Content
              v-for="(section, index) in sections"
              :key="index"
              :value="String(index)"
              class="text-ui-md text-pretty text-muted-foreground"
            >
              {{ section.body }}
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  </section>
</template>
